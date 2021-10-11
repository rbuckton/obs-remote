/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import * as H from "history";
import React from "react";
import PropTypes from "prop-types";
import { useParams, useHistory, useLocation } from "react-router-dom";
import { PropInjector, ConsistentWith, DistributiveOmit } from "@mui/types";
import { getDisplayName } from "@mui/utils";
import { ParamsProps, WithParams } from "./withParams";

export interface WithNavigation<Params extends { [K in keyof Params]?: string } = {}, S = H.LocationState> extends WithParams<Params> {
    history: H.History<S>;
    location: H.Location<S>;
};

export interface NavigationProps<Params extends { [K in keyof Params]?: string } = {}, S = H.LocationState> extends ParamsProps<Params> {
    history?: H.History<S>;
    location?: H.Location<S>;
}

// type InputComponent<C extends React.JSXElementConstructor<ConsistentWith<React.ComponentProps<C>, InjectedProps>>, InjectedProps> = React.JSXElementConstructor<ConsistentWith<React.ComponentProps<C>, InjectedProps>>;
// type InputProps<C extends InputComponent<C, InjectedProps>, InjectedProps> = ConsistentWith<React.ComponentProps<C>, InjectedProps>;

// type OutputProps<C extends InputComponent<C, InjectedProps>, InjectedProps, AdditionalProps> = 
//     DistributiveOmit<JSX.LibraryManagedAttributes<C, React.ComponentProps<C>>, keyof InjectedProps> & AdditionalProps;

// type OutputComponent<C extends InputComponent<C, InjectedProps>, InjectedProps, AdditionalProps> = 
//     React.JSXElementConstructor<OutputProps<C, InjectedProps, AdditionalProps>>;

export function withNavigation<
    Params extends { [K in keyof Params]?: string } = {},
    S = H.LocationState,
>(defaults?: Partial<Params>) {
    type InjectedProps = WithNavigation<Params, S>;
    type AdditionalProps = NavigationProps<Params, S>;
    return function (Component) {
        type C = typeof Component;
        const WithNavigation = React.forwardRef(function WithNavigation(props: JSX.LibraryManagedAttributes<C, ConsistentWith<React.ComponentProps<C>, InjectedProps>>, ref) {
            const history = useHistory<S>();
            const location = useLocation<S>();
            const params = useParams<Params>();
            return <Component 
                ref={ref}
                params={{ ...defaults, ...params }}
                history={history}
                location={location}
                {...props}
            />;
        });
        if (process.env.NODE_ENV !== "production") {
            Object.setPrototypeOf(WithNavigation, Component);
            WithNavigation.propTypes = {
                params: PropTypes.object,
                history: PropTypes.object,
                location: PropTypes.object
            } as any;
            WithNavigation.displayName = `WithNavigation(${getDisplayName(Component)})`;
        }
        return WithNavigation;
    } as PropInjector<InjectedProps, AdditionalProps>;
}