import {Button} from "./button";
import {InputGroup, InputGroupAddon, InputGroupInput} from "./input-group";
import {Eye, EyeOff} from "lucide-react";
import {ComponentProps, useState} from "react";


export function PasswordInput(props: ComponentProps<typeof InputGroupInput>) {
    const [visible, setVisible] = useState<boolean>(false)
    return (
        <InputGroup>
            <InputGroupInput type={visible ? "text" : "password"} placeholder="Digite sua senha" {...props} />
            <InputGroupAddon align={"inline-end"}>
                <Button type="button" variant={"link"} size={"icon-sm"} onClick={() => setVisible((s) => !s)}
                        className="active:translate-y-0!">
                    {visible ? <EyeOff/> : <Eye/>}
                </Button>
            </InputGroupAddon>
        </InputGroup>
    )
}