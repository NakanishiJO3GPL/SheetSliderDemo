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
                    let (vendor_id, product_id) = (0x1209, 0x0001); // Example VID and PID
                    let device = api.open(vendor_id, product_id)
                        .expect("Failed to open HID device");

                    let mut buf = [0u8; 64];
                    let mut last_value: i32 = -1;

                    loop {
                        // Read data from HID device
                        let Ok(size) = device.read(&mut buf) else {
                            continue;
                        };
                        
                        // Ensure we have at least 2 bytes of data
                        if size < 2 {
                            continue;
                        }
                        
                        // Parse raw value from first 2 bytes (little-endian)
                        let value = i32::from_le_bytes([buf[0], buf[1], 0, 0]);
                        
                        // Convert to percentage value (0-100 range)
                        let percent_value = (value as f32 / 8192.0 * 100.0).round() as i32;
                        
                        // Only process if the value has changed
                        if percent_value == last_value {
                            continue;
                        }
                        
                        // Convert to keycode and emit event if valid
                        if let Some(keycode) = conv_keycode(last_value, percent_value) {
                            app_handle
                                .emit("key-pressed", keycode)
                                .expect("Failed to emit event");
                        }
                        
                        // Update last known value
                        last_value = percent_value;
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
fn conv_keycode(prev: i32, value: i32) -> Option<String> {
    // Range 1: 32 < value <= 38 → Return button press
    if value > 32 && value <= 38 {
        return Some("Return".to_string());
    }
    
    // Range 2: 42 < value <= 48 → Left rotation
    if value > 42 && value <= 48 {
        return Some("Left".to_string());
    }
    
    // Range 3: 48 < value <= 54 → Direction depends on previous value
    if value > 48 && value <= 54 {
        let diff = 2;
        if prev + diff < value {
            return Some("Right".to_string());
        } else if prev - diff > value {
            return Some("Left".to_string());
        } else {
            return None;
        }
    }
    
    // Range 4: 60 < value <= 67 → Right rotation
    if value > 60 && value <= 67 {
        return Some("Right".to_string());
    }
    
    // Range 5: 70 < value <= 77 → Ok button press
    if value > 70 && value <= 77 {
        return Some("Ok".to_string());
    }
    
    // Outside all defined ranges
    None
}