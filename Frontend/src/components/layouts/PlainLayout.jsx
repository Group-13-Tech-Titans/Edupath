// Use for group of routes to share specific logic (like authentication checks, analytics tracking, or state providers) without changing how the page looks.

import React from "react";
import { Outlet } from "react-router-dom";

export default function PlainLayout() {
  return <Outlet />;
}
