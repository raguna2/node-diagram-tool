import { Switch, Route } from "wouter";
import Home from "@/pages/Home";
import ForceGraphEditor from "@/components/ForceGraphEditor";
import Catalog from "@/pages/Catalog";

function App() {
  return (
    <div className="h-screen w-screen bg-[#2C2C2C] text-foreground">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/editor" component={ForceGraphEditor} />
        <Route path="/editor/:id" component={ForceGraphEditor} />
        <Route path="/catalog" component={Catalog} />
        <Route>404 Page Not Found</Route>
      </Switch>
    </div>
  );
}

export default App;
