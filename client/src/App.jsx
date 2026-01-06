import { RouterProvider } from "react-router-dom";
import router from "./routes/AppRoutes";
import { PrimeReactProvider} from 'primereact/api';

const App = () => {
  return (
    <PrimeReactProvider value={{ ripple: true }}>
      <RouterProvider router={router} />
    </PrimeReactProvider>
  );
};

export default App;
