import React, { useContext, useEffect, useState } from "react";
import { Redirect } from "react-router-dom";
import { AppContext } from "./utils/context";

export const Home = () => {
    // state
    const { connected, preferences } = useContext(AppContext);
    const [autoConnect, setAutoConnect] = useState(() => preferences.autoConnect.value);

    // behavior

    // effects
    useEffect(() => {
        preferences.autoConnect.onDidValueChange.on(setAutoConnect);
        return () => {
            preferences.autoConnect.onDidValueChange.off(setAutoConnect);
        };
    }, [preferences, setAutoConnect]);

    // ui
    return <Redirect to={
        connected ? "/dashboard" :
        autoConnect ? "/autoConnect" :
        "/connect"
    } />
}