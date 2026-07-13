import { RouterProvider } from "react-router";
import { router } from "./app.routes.jsx";
import { AuthProvider } from "./features/auth/auth.context.jsx";
import { InterViewProvider } from "./features/ai/interview.context.jsx";

function App() {
  return (
    <AuthProvider>
      <InterViewProvider>
        <RouterProvider router={router} />
      </InterViewProvider>
    </AuthProvider>
  );
}

export default App;
