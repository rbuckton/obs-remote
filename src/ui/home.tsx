/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { Redirect } from "react-router-dom";
import { usePreference } from "./hooks/usePreference";
import { useAppContext } from "./utils/appContext";

export const Home = () => {
    // state
    const href =
        useAppContext().connected ? "/dashboard" :
        usePreference("autoConnect")[0] ? "/autoConnect" :
        "/connect";

    // behavior
    // effects
    // ui
    return <Redirect to={href} />;
}