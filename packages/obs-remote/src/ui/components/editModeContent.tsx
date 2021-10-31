/*-----------------------------------------------------------------------------------------
 * Copyright © 2021 Ron Buckton. All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *-----------------------------------------------------------------------------------------*/

import type { OverrideProps } from "@mui/types";
import clsx from "clsx";
import { ElementType, forwardRef, ReactNode } from "react";
import { OverridableFunctionComponent } from "../../core/renderer/types";
import { useEditContainerContext } from "../utils/editContainerContext";
import { globalClasses } from "./globalStyles";

export interface EditModeContentTypeMap<P = {}, D extends ElementType = "span"> {
    props: P & {
        children?: ReactNode;
    };
    defaultComponent: D;
}

export type EditModeContentProps<
    D extends ElementType = EditModeContentTypeMap['defaultComponent'],
    P = {}
> = OverrideProps<EditModeContentTypeMap<P, D>, D>;

export const EditModeContent = forwardRef(({
    component: Component = "span",
    className,
    ...props
}: EditModeContentProps & { component?: ElementType }, ref) => {
    const { hidden } = useEditContainerContext();
    return <Component 
        ref={ref}
        className={clsx(
            hidden ? globalClasses.editModeHidden : undefined,
            className
        )}
        {...props} />

}) as OverridableFunctionComponent<EditModeContentTypeMap>;

if (process.env.NODE_ENV !== "production") {
    EditModeContent.displayName = "EditModeContent";
}