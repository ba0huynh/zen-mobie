import env from "@/../env";

export const isDevelopment = () => {
  return env.NODE_ENV === "development";
};
