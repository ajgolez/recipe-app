import { cva } from "class-variance-authority";

export const checkboxVariants = cva(
  "peer border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive disabled:cursor-not-allowed",
  {
    variants: {
      size: {
        sm: "size-3",
        md: "size-4",
        lg: "size-5",
      },
      variant: {
        default:
          "data-[state=checked]:bg-primary data-[state=checked]:border-primary text-white",
        success:
          "data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500",
        warning:
          "data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500",
        danger:
          "data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500",
      },
      shape: {
        square: "rounded-none",
        rounded: "rounded-md",
        pill: "rounded-full",
      },
      disabledStyle: {
        faded: "disabled:opacity-50",
        outline: "disabled:border-dashed disabled:border-2",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
      shape: "rounded",
    },
  }
);
