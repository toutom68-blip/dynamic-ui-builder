import { Routes as RouterRoutes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MainLayout } from "@/modules/shared/layout/MainLayout";
import { useLoadingIntegration } from "@/modules/shared/hooks/useLoadingIntegration";
import Index from "@/pages/Index";
import Auth from "@/modules/auth/auth.component";
import NotFound from "@/pages/NotFound";
import { ComponentsDemo } from "@/modules/demo/pages/ComponentsDemo";
import { FilterDemo } from "@/modules/demo/pages/FilterDemo";
import { GridDemo } from "@/modules/demo/pages/GridDemo";
import { Settings } from "@/modules/settings/settings.component";

export const Routes = () => {
  // Integrate loading context with axios
  useLoadingIntegration();

  return (
    <RouterRoutes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        }
      />
      <Route
        path="/auth"
        element={
          <ProtectedRoute requireAuth={false}>
            <Auth />
          </ProtectedRoute>
        }
      />
      <Route
        path="/demo"
        element={
          // <ProtectedRoute requiredRoles={['admin']}>
          //   <MainLayout>
          //     <ComponentsDemo />
          //   </MainLayout>
          // </ProtectedRoute>

          <ProtectedRoute >
            <MainLayout>
              <ComponentsDemo />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/demo/filters"
        element={
          <ProtectedRoute >
            <MainLayout>
              <FilterDemo />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/demo/grid"
        element={
          <ProtectedRoute >
            <MainLayout>
              <GridDemo />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </RouterRoutes>
  );
};
