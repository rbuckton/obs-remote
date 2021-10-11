/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import React from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import { PropInjector, ConsistentWith } from "@mui/types";
import { getDisplayName } from "@mui/utils";

export interface WithParams<Params extends { [K in keyof Params]?: string } = {}> {
    params: Partial<Params>;
}

export interface ParamsProps<Params extends { [K in keyof Params]?: string } = {}> {
    params?: Partial<Params>;
}

export function withParams<
    Params extends { [K in keyof Params]?: string } = {}
>(defaults?: Partial<Params>) {
    return function <C extends React.ComponentType<ConsistentWith<React.ComponentProps<C>, WithParams<Params>>>>(Component: C) {
        const WithParams = React.forwardRef(function WithParams({ ...props }: React.ComponentProps<C>, ref) {
            const params = useParams<Params>();
            return React.createElement(Component, {
                ref,
                params: { ...defaults, ...params },
                ...props,
            });
        });
        if (process.env.NODE_ENV !== "production") {
            Object.setPrototypeOf(WithParams, Component);
            WithParams.propTypes = { params: PropTypes.object } as any;
            WithParams.displayName = `WithParams(${getDisplayName(Component)})`;
        }
        return WithParams;
    } as PropInjector<WithParams<Params>, ParamsProps<Params>>;
}