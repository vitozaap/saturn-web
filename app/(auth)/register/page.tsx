import { ViewTransition } from "react";

import { RegisterForm } from "@/components/forms/register";
import { TabsContent } from "@/components/ui/tabs";

export default function Register() {
    return (
        <ViewTransition name="auth-panel" share="auto" enter="auto" exit="auto" default="none">
            <TabsContent value={"register"}>
                <RegisterForm />
            </TabsContent>
        </ViewTransition>
    )
}
