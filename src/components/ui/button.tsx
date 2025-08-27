import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps } from "class-variance-authority";
import { cn } from "./utils";
import { buttonVariants } from "@/styles/buttonVariants";

const Button = React.forwardRef<
  HTMLButtonElement,                          // This button will be rendered as an HTML <button> element
  React.ComponentProps<"button"> &            // Accept all standard <button> props (like onClick, disabled, etc.)
    VariantProps<typeof buttonVariants> & {   // Also accept the "variant" and "size" props from the CVA config
      asChild?: boolean;                      // Optional prop to render as a different component; component can render a different HTML element or custom component — while still applying all the same styles and behavior.  
    }
>(
  // This is the actual component function
  ({ className, variant, size, asChild = false, ...props }, ref) => {

  // Choose what component to render:
  // If `asChild` is true, use <Slot /> (e.g. to wrap a custom component)
  // Otherwise, render a regular <button>
  // <Slot /> acts as a placeholder that passes props (like className, onClick, etc.) down to its child.
  // the same button styles can be used on <button>, <a>, <div>, etc
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref} // Forward the ref so parent components can reference the button DOM node
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };
