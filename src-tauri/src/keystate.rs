#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum KeyState {
    Idle,
    Pressed,
    Released,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct KeyStateMachine {
    pub state: KeyState,
    pub prev_state: KeyState,
}

impl KeyState {
    /// Transition to the next state based on current input
    pub fn transition(&self, pos: i32) -> KeyState {
        let is_pressed = pos > 2000;
        match (self, is_pressed) {
            (KeyState::Idle, true) => KeyState::Pressed,
            (KeyState::Idle, false) => KeyState::Idle,
            (KeyState::Pressed, true) => KeyState::Pressed,
            (KeyState::Pressed, false) => KeyState::Released,
            (KeyState::Released, true) => KeyState::Released,
            (KeyState::Released, false) => KeyState::Idle,
        }
    }
}

impl Default for KeyState {
    fn default() -> Self {
        KeyState::Idle
    }
}

impl Default for KeyStateMachine {
    fn default() -> Self {
        KeyStateMachine {
            state: KeyState::Idle,
            prev_state: KeyState::Idle,
        }
    }
}

impl KeyStateMachine {
    /// Update the state machine with the new position
    pub fn update(&mut self, pos: i32) {
        let new_state = self.state.transition(pos);
        self.prev_state = self.state;
        self.state = new_state;
    }

    pub fn is_pressed(&self) -> bool {
        self.state == KeyState::Pressed && self.prev_state != KeyState::Pressed
    }

    pub fn current_state(&self) -> u8 {
        self.state as u8
    }
}