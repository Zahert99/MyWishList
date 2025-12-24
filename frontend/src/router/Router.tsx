import { Routes, Route } from "react-router-dom";
import { lazyWithPreload } from "react-lazy-with-preload";
import type { RouterProps, HomeViewProps, MyPageViewProps } from "../types.ts";
import type { ComponentType } from "react";

// Exportera lazy-loadade komponenter med korrekt typing
export const HomeScreen = lazyWithPreload(
  () => import("../views/HomeView.tsx")
) as unknown as ComponentType<HomeViewProps> & { preload: () => Promise<any> };

export const MyPageScreen = lazyWithPreload(
  () => import("../views/MyPageView.tsx")
) as unknown as ComponentType<MyPageViewProps> & {
  preload: () => Promise<any>;
};

export const PrivacyPolicyScreen = lazyWithPreload(
  () => import("../views/PrivacyPolicyView.tsx")
) as unknown as ComponentType<{}> & { preload: () => Promise<any> };

export default function Router({ user, onLogin, onLogout }: RouterProps) {
  return (
    <Routes>
      <Route
        path='/'
        element={
          <HomeScreen user={user} onLogin={onLogin} onLogout={onLogout} />
        }
      />
      <Route
        path='/me'
        element={
          <MyPageScreen user={user} onLogin={onLogin} onLogout={onLogout} />
        }
      />
      <Route path='/policy' element={<PrivacyPolicyScreen />} />
    </Routes>
  );
}
