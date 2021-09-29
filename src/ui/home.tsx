import React from "react";
import { Redirect } from "react-router-dom";
import { usePreference } from "./hooks/usePreference";
import { useAppContext } from "./utils/context";

export const Home = () => {
    // state
    const href =
        useAppContext().connected ? "/dashboard" :
        usePreference("autoConnect") ? "/autoConnect" :
        "/connect";

    // behavior
    // effects
    // ui
    return <Redirect to={href} />
}