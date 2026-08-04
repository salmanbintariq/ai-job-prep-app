import { RouterProvider } from "react-router";
import { router } from "./app.routes.jsx";
import { AuthProvider } from "./features/auth/auth.context.jsx";
import { InterViewProvider } from "./features/ai/interview.context.jsx";
import {Toaster} from "sonner";

function App() {
  return (
    <AuthProvider>
      <InterViewProvider>
        <Toaster position="top-right" richColors duration={4000} />
        <RouterProvider router={router} />
      </InterViewProvider>
    </AuthProvider>
  );
}

export default App;
