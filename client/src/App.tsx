import { Switch, Route } from "wouter";
import Home from "@/pages/Home";
import D3FlowEditor from "@/components/D3FlowEditor";
import Catalog from "@/pages/Catalog";

function App() {
  return (
    <div className="h-screen w-screen bg-[#2C2C2C] text-foreground">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/editor">
            <D3FlowEditor />
          </Route>
          <Route path="/editor/:id">
            <D3FlowEditor />
          </Route>
        <Route path="/catalog" component={Catalog} />
        <Route>404 Page Not Found</Route>
      </Switch>
    </div>
  );
}

export default App;
