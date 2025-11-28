use tauri::Emitter;
use hidapi::HidApi;
use tokio::task;

mod keystate;
use keystate::{KeyState, KeyStateMachine};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    const SLIDER_MIN: i32 = 254;
    const SLIDER_MAX: i32 = 277;

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

                    let mut hid_buf = [0u8; 64];
					let mut key_state = KeyStateMachine::default();
                    let mut pos_buf = [0i32; 20];
                    let mut prev_slider_pos = 0;

                    loop {
                        // Read data from HID device
                        let Ok(size) = device.read(&mut hid_buf) else {
                            continue;
                        };
                        
                        // Ensure we have at least 3 bytes of data
                        if size < 3 {
                            continue;
                        }
                        
						// hid_buf[0] : report ID, 
						// hid_buf[1],[2] : ADC value (LSB, MSB)
						// hid_buf[3] : event type (not used currently)
                        let pos = i32::from_le_bytes([hid_buf[1], hid_buf[2], 0, 0]);

                        // Calculate 10-point moving average
                        pos_buf.rotate_right(1);
                        pos_buf[0] = pos;
                        let pos_ave = pos_buf.iter().sum::<i32>() / (pos_buf.len() as i32);
                        
						key_state.update(pos_ave);
                        let is_pressed = key_state.is_pressed();
                        let is_touched = key_state.is_touched();
                        
                        // Calculate slider direction
                        let slider_pos = f32::round((pos as f32) / 10.0) as i32;
                        let slider_dir = get_slider_dir(prev_slider_pos, slider_pos, is_touched);
                        prev_slider_pos = slider_pos;

                        // Convert to keycode and emit event if valid
                        if let Some(keycode) = conv_keycode(pos, slider_dir, is_pressed) {
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

fn conv_keycode(pos: i32, slider_dir: i32, is_pressed: bool) -> Option<String> {
    if slider_dir != 0 {
        // Slider moved
        Some(format!("{}", if slider_dir > 0 { "Left" } else { "Right" }))
    }
    else if is_pressed {
    	match pos {
    	    3070..=3120 => {
    			// Return button press
    			Some("Return".to_string())
    		},
    		2840..=2910 => {
    			// Left rotation
    			Some("Left".to_string())
    		},
    		2500..=2550 => {
    			// Right rotation
    			Some("Right".to_string())
    		},
    		2340..=2440 => {
    			// Ok button press
    			Some("Ok".to_string())
    		},
    		_ => {
    			// Outside defined ranges
    			None
    		}
        }
	}
    else {
        None
    }
}

fn get_slider_dir(prev: i32, current: i32, is_touched: bool) -> i32 {
    const SLIDER_MIN: i32 = 254;
    const SLIDER_MAX: i32 = 288;
    const SENSITIVITY: i32 = 6;
    let prev_s = prev / SENSITIVITY;
    let current_s = current / SENSITIVITY;

    let key =
    if !is_touched {
        0
    } else if SLIDER_MIN <= current && current <= SLIDER_MAX {
        if current_s > prev_s { 1 } 
        else if current_s < prev_s { -1 } 
        else { 0 }
    } else {
        0
    };

    key
}
