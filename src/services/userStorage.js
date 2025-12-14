// src/services/userStorage.js

const USER_KEY = 'parking_current_user_v1';

export function getStoredUser() {
    return localStorage.getItem(USER_KEY);
}

export function setStoredUser(user) {
    localStorage.setItem(USER_KEY, user);
}

export function clearStoredUser() {
    localStorage.removeItem(USER_KEY);
}
