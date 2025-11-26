use tauri::Emitter;
use hidapi::HidApi;
use tokio::task;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle().clone();

            tauri::async_runtime::spawn(async move {
                // Because of hidapi is blocking, we need to use spawn_blocking
                task::spawn_blocking(move || {
                    let api = HidApi::new().expect("Failed to create HID API instance");
                    let (vendor_id, product_id) = (0x2e8a, 0x000a); // Example VID and PID
                    let device = api.open(vendor_id, product_id)
                        .expect("Failed to open HID device");

                    let mut buf = [0u8; 64];
                    let mut last_value: i32 = -1;
					let mut last_keycode: String = "".to_string();
					let mut key_counter = [0u8; 4];

                    loop {
                        // Read data from HID device
                        let Ok(size) = device.read(&mut buf) else {
                            continue;
                        };
                        
                        // Ensure we have at least 2 bytes of data
                        if size < 2 {
                            continue;
                        }
                        
                        // Parse raw value from 2 bytes (little-endian)
						// buf[0] is report ID, buf[1] and buf[2] contain the value
                        let value = i32::from_le_bytes([buf[1], buf[2], 0, 0]);
                        
						println!("value: {}", value);

                        // Convert to keycode and emit event if valid
                        if let Some(keycode) = conv_keycode(last_value, &mut key_counter, value) {
							if keycode != last_keycode {
								println!("Emitting keycode: {}", keycode);
                            	app_handle
                            	    .emit("key-pressed", keycode.clone())
                            	    .expect("Failed to emit event");
								last_keycode = keycode;
							}
                        }
						else {
							last_keycode = "".to_string();
						}
                        
                        // Update last known value
                        last_value = value;
                    }
                });
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// Convert raw HID value to keycode string
// Translates the encoder position value into corresponding key events
fn conv_keycode(_prev: i32, key_counter: &mut [u8; 4], value: i32) -> Option<String> {
    // Direction depends on previous value
	/*
    if value > 2570 && value <= 2860{
        let diff = 16;
        if prev + diff < value {
            return Some("Left".to_string());
        } else if prev - diff > value {
            return Some("Right".to_string());
		}
	}
	*/

	const CHATA: u8 = 5;
	match value {
		3080..=3180 => {
			// Return button press
			key_counter[0] = key_counter[0].wrapping_add(1);
			if key_counter[0] == CHATA {
				for c in key_counter.iter_mut() {
					*c = 0;
				}
				return Some("Return".to_string());
			} else {
				return None;
			}
		},
		2870..=2886 => {
			// Left rotation
			key_counter[1] = key_counter[1].wrapping_add(1);
			if key_counter[1] == CHATA {
				for c in key_counter.iter_mut() {
					*c = 0;
				}
				return Some("Left".to_string());
			} else {
				return None;
			}
		},
		2534..=2560 => {
			// Right rotation
			key_counter[2] = key_counter[2].wrapping_add(1);
			if key_counter[2] == CHATA {
				for c in key_counter.iter_mut() {
					*c = 0;
				}
				return Some("Right".to_string());
			} else {
				return None;
			}
		},
		2250..=2350 => {
			// Ok button press
			key_counter[3] = key_counter[3].wrapping_add(1);
			if key_counter[3] == CHATA {
				for c in key_counter.iter_mut() {
					*c = 0;
				}
				return Some("Ok".to_string());
			} else {
				return None;
			}
		},
		_ => {
			// Reset counters if out of range
			for c in key_counter.iter_mut() {
				*c = 0;
			}
		}
	}
    
    // Outside all defined ranges
    None
}