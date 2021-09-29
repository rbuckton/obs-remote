import * as H from "history";
import React from "react";
import PropTypes from "prop-types";
import { useParams, useHistory, useLocation } from "react-router-dom";
import { PropInjector, ConsistentWith } from "@material-ui/types";
import { getDisplayName } from "@material-ui/utils";
import { WithParams } from "./withParams";

export interface WithNavigation<Params extends { [K in keyof Params]?: string } = {}, S = H.LocationState> extends WithParams<Params> {
    params: Partial<Params>;
    history: H.History<S>;
    location: H.Location<S>;
};

export type WithNavigationProps<Params extends { [K in keyof Params]?: string } = {}, S = H.LocationState> = {
    params?: Partial<Params>;
    history?: H.History<S>;
    location?: H.Location<S>;
};

export function withNavigation<
    Params extends { [K in keyof Params]?: string } = {},
    Props extends object = {},
    S = H.LocationState,
>(defaults?: Partial<Params>) {
    return function <C extends React.ComponentType<ConsistentWith<React.ComponentProps<C>, WithNavigation<Params, S>>>>(Component: C) {
        const WithNavigation = React.forwardRef(function WithNavigation({ ...props }: React.ComponentProps<C>, ref) {
            const history = useHistory<S>();
            const location = useLocation<S>();
            const params = useParams<Params>();
            return React.createElement(Component, {
                ref,
                params: { ...defaults, ...params },
                history,
                location,
                ...props,
            });
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
    } as PropInjector<WithNavigation<Params, S>, WithNavigationProps<Params, S> & Props>;
}