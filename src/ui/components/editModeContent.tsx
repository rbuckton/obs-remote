import React, { forwardRef, ReactNode } from "react";
import { OverrideProps } from "@material-ui/core/OverridableComponent";
import { OverridableComponent } from "@material-ui/core/OverridableComponent";
import { useEditModeClassName } from "./editModeContainer";
import clsx from "clsx";

export interface EditModeContentTypeMap<P = {}, D extends React.ElementType = "span"> {
    props: P & {
        hidden?: boolean;
        children?: ReactNode;
    };
    defaultComponent: D;
    classKey: never;
}

export type EditModeContentProps<
    D extends React.ElementType = EditModeContentTypeMap['defaultComponent'],
    P = {}
> = OverrideProps<EditModeContentTypeMap<P, D>, D>;

export const EditModeContent = forwardRef(({
    component: ComponentProp = "span",
    hidden,
    className,
    ...props
}: EditModeContentProps & { component?: React.ElementType }, ref) => {
    const editModeClassName = useEditModeClassName(hidden);
    return <ComponentProp className={clsx([editModeClassName, className])} {...props} />
}) as OverridableComponent<EditModeContentTypeMap>;