use tauri::Emitter;
use hidapi::HidApi;
use tokio::task;

mod keystate;
use keystate::{KeyState, KeyStateMachine};

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
                    let mut pos_buf = [0i32; 10];
					let mut key_state = KeyStateMachine::default();

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
						// buf[0] is report ID, 
						// buf[1] and buf[2] contain the value
						// buf[3] contains event type (not used currently)
                        let pos = i32::from_le_bytes([buf[1], buf[2], 0, 0]);

                        // Calculate 10-point moving average
                        pos_buf.rotate_right(1);
                        pos_buf[0] = pos;
                        let pos_ave = pos_buf.iter().sum::<i32>() / (pos_buf.len() as i32);

						key_state.update(pos_ave);
                        let is_pressed = key_state.is_pressed();
                        let current = key_state.current_state();

						// for DEBUG
                        if is_pressed {
						    app_handle.emit("adc-value", (pos_ave, current)).expect("Failed to emit adc-value event");
                        }

                        // Convert to keycode and emit event if valid
                        if let Some(keycode) = conv_keycode(pos, is_pressed) {
                          	app_handle
                           	    .emit("key-pressed", keycode.clone())
                           	    .expect("Failed to emit event");
                        }
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
fn conv_keycode(pos: i32, is_pressed: bool) -> Option<String> {
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

	match (pos, is_pressed) {
		(3070..=3120, true) => {
			// Return button press
			Some("Return".to_string())
		},
		(2840..=2910, true) => {
			// Left rotation
			Some("Left".to_string())
		},
		(2500..=2550, true) => {
			// Right rotation
			Some("Right".to_string())
		},
		(2340..=2440, true) => {
			// Ok button press
			Some("Ok".to_string())
		},
		_ => {
			// Outside defined ranges
			None
		}
	}
}