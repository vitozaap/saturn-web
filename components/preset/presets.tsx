
import { Controller, useFormContext } from "react-hook-form";
import { Badge } from "../ui/badge";
import { Field, FieldContent, FieldDescription, FieldTitle, FieldLabel } from "../ui/field";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { items } from "./items";
import { ICompressionForm } from "../dropzone/validation";


export function Presets() {
    const { control } = useFormContext<ICompressionForm>()
    return (
        <div className="flex items-center flex-col gap-4">
            <h1 className="text-muted-foreground/80 font-medium text-sm">Nível de compressão</h1>
            <Controller
                control={control}
                name="preset"
                render={({ field }) => (
                    <RadioGroup
                        defaultValue={"MID"}
                        name={field.name}
                        className="flex flex-1"
                        value={field.value}
                        onValueChange={field.onChange}>
                        {items.map((preset) => (
                            <FieldLabel htmlFor={preset.title} className="relative has-data-checked:border-primary has-data-checked:bg-primary/10" key={preset.selector}>
                                {preset.recommended === true && (<Badge className="absolute -top-2.5 right-4 rotate-2 bg-coral">Recomendado</Badge>)}
                                <Field orientation={"horizontal"} key={preset.selector}>
                                    <FieldContent>
                                        <Badge variant={field.value === preset.selector ? "default" : "secondary"}>{preset.selector}</Badge>
                                        <FieldTitle>{preset.title}</FieldTitle>
                                        <FieldDescription>{preset.description}</FieldDescription>
                                    </FieldContent>
                                    <RadioGroupItem value={preset.selector} id={preset.title} />
                                </Field>
                            </FieldLabel>
                        ))}
                    </RadioGroup>)}
            />

        </div>
    )
}