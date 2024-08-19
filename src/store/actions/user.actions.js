import { userService } from "../../services/user.local.service.js";
import { UPDATE_USER, SET_LOGGED_USER } from "../reducers/user.reducer.js";
import { store } from "../store.js";

export function logInUser(credentials) {
    return userService.login(credentials)
        .then(loggedInUser => {
            store.dispatch({ type: SET_LOGGED_USER, loggedinUser: loggedInUser });
            return loggedInUser; // Ensure this returns the user
        });
}

export function signUpUser(credentials) {
    return userService.signup(credentials)
        .then(loggedInUser => {
            store.dispatch({ type: SET_LOGGED_USER, loggedinUser: loggedInUser });
            return loggedInUser; // Ensure this returns the user
        });
}

export function updateUser(user) {
    return userService.updateUser(user)
        .then(updatedUser => {
            store.dispatch({ type: UPDATE_USER, updatedUser });
            return updatedUser; // Ensure this returns the user
        });
}

export function logout() {
    return userService.logout()
        .then(() => store.dispatch({ type: SET_LOGGED_USER, loggedinUser: null }));
}
