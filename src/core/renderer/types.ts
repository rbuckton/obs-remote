/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import { DefaultComponentProps, OverridableComponent, OverridableTypeMap } from "@mui/types";
import { ValidationMap } from "prop-types";
import { WeakValidationMap } from "react";

export interface OverridableFunctionComponent<M extends OverridableTypeMap> extends OverridableComponent<M> {
    propTypes?: WeakValidationMap<DefaultComponentProps<M>> | undefined;
    contextTypes?: ValidationMap<any> | undefined;
    defaultProps?: Partial<DefaultComponentProps<M>> | undefined;
    displayName?: string | undefined;
}
