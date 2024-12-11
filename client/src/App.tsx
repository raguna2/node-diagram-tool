import { Switch, Route } from "wouter";
import FlowEditor from "@/components/FlowEditor";
import { ScrollArea } from "@/components/ui/scroll-area";

function App() {
  return (
    <div className="h-screen w-screen bg-background text-foreground">
      <ScrollArea className="h-full w-full">
        <Switch>
          <Route path="/" component={FlowEditor} />
          <Route>404 Page Not Found</Route>
        </Switch>
      </ScrollArea>
    </div>
  );
}

export default App;
