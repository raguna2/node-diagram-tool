import { Switch, Route } from "wouter";
import Home from "@/pages/Home";
import VisxFlowEditor from "@/components/VisxFlowEditor";
import Catalog from "@/pages/Catalog";

function App() {
  return (
    <div className="h-screen w-screen bg-[#2C2C2C] text-foreground">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/editor" component={VisxFlowEditor} />
        <Route path="/editor/:id" component={VisxFlowEditor} />
        <Route path="/catalog" component={Catalog} />
        <Route>404 Page Not Found</Route>
      </Switch>
    </div>
  );
}

export default App;
