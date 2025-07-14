
"use client";

import * as React from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Minus, Equal, Percent, BrainCircuit, Trash2, Divide, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { StrategicPlanFormValues } from "@/lib/schemas";

const BudgetCalculator = ({ form }: { form: UseFormReturn<StrategicPlanFormValues> }) => {
    const [entries, setEntries] = React.useState<{label: string, amount: number}[]>([]);
    const [newLabel, setNewLabel] = React.useState("");
    const [newAmount, setNewAmount] = React.useState("");

    const handleAddEntry = () => {
        const amount = parseFloat(newAmount);
        if (newLabel.trim() && !isNaN(amount)) {
            setEntries([...entries, { label: newLabel, amount }]);
            setNewLabel("");
            setNewAmount("");
        }
    };

    const handleRemoveEntry = (index: number) => {
        setEntries(entries.filter((_, i) => i !== index));
    };

    const manualTotal = entries.reduce((acc, entry) => acc + entry.amount, 0);

    const formBudgetValues = form.watch(["governmentBudgetAmount", "grantBudgetAmount", "sdgBudgetAmount"]);
    const formTotal = formBudgetValues.reduce((acc, val) => acc + (parseFloat(val || '0') || 0), 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle>የበጀት ማስያ</CardTitle>
                <CardDescription>የተለያዩ ወጪዎችን በፍጥነት ይደምሩ።</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    {entries.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <span className="flex-1 p-2 bg-muted rounded-md text-sm">{entry.label}</span>
                            <span className="p-2 bg-muted rounded-md font-mono text-sm">{entry.amount.toLocaleString()}</span>
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveEntry(index)}>
                                <Minus className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
                 <div className="flex items-center gap-2">
                    <Input placeholder="የወጪ አይነት" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
                    <Input type="number" placeholder="መጠን" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} />
                    <Button variant="outline" size="icon" onClick={handleAddEntry}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                 <Separator />
                <div className="text-right text-xl font-bold">
                    ጠቅላላ ድምር: <span className="font-mono text-primary">{manualTotal.toLocaleString()} ብር</span>
                </div>
                 <Separator />
                 <div className="text-right text-lg font-semibold">
                    በቅጹ ውስጥ ያለው ጠቅላላ በጀት: <span className="font-mono text-accent">{formTotal.toLocaleString()} ብር</span>
                </div>
            </CardContent>
        </Card>
    )
}

const WeightBalancer = ({ 
    title,
    description,
    form,
    fieldArrayName,
    weightFieldName
}: { 
    title: string,
    description: string,
    form: UseFormReturn<StrategicPlanFormValues>,
    fieldArrayName: "objectives" | `objectives.${number}.strategicActions`,
    weightFieldName: `objectives.${number}.objectiveWeight` | `objectives.${number}.strategicActions.${number}.weight`
}) => {
    const objectives = form.watch("objectives");
    
    let totalWeight = 0;
    let itemsToUpdate: {path: any, value: number}[] = [];

    if (fieldArrayName === "objectives") {
        totalWeight = objectives.reduce((acc, obj) => acc + (parseFloat(obj.objectiveWeight) || 0), 0);
        objectives.forEach((obj, index) => {
            const value = parseFloat(obj.objectiveWeight) || 0;
            if (value > 0) {
                 itemsToUpdate.push({ path: `objectives.${index}.objectiveWeight`, value });
            }
        });
    } else { // For strategic actions, sum across ALL objectives
        totalWeight = objectives.reduce((acc, obj) => 
            acc + obj.strategicActions.reduce((actAcc, action) => actAcc + (parseFloat(action.weight) || 0), 0)
        , 0);

        objectives.forEach((obj, objIndex) => {
            obj.strategicActions.forEach((action, actIndex) => {
                const value = parseFloat(action.weight) || 0;
                if (value > 0) {
                    itemsToUpdate.push({ path: `objectives.${objIndex}.strategicActions.${actIndex}.weight`, value });
                }
            });
        });
    }
    
    const handleNormalize = () => {
        if (totalWeight === 0) return;
        
        itemsToUpdate.forEach(item => {
            const normalizedValue = (item.value / totalWeight) * 100;
            form.setValue(item.path, normalizedValue.toFixed(2), { shouldValidate: true });
        });
    };
    
    const needsBalancing = Math.abs(totalWeight - 100) > 0.01;

    return (
         <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
                <p className="text-4xl font-bold font-mono" style={{color: needsBalancing ? "hsl(var(--destructive))" : "hsl(var(--primary))"}}>
                    {totalWeight.toFixed(2)}%
                </p>
                <p className="text-muted-foreground">የአሁኑ ጠቅላላ ክብደት</p>
                 <Button onClick={handleNormalize} disabled={totalWeight === 0 || !needsBalancing}>
                    <Percent className="mr-2 h-4 w-4" /> ክብደቶችን ወደ 100% አስተካክል
                </Button>
            </CardContent>
            <CardFooter>
                 {!needsBalancing && <p className="text-sm text-green-600 w-full text-center">ክብደቶች በትክክል ወደ 100% ተስተካክለዋል።</p>}
            </CardFooter>
        </Card>
    )
}

const SimpleCalculator = () => {
    const [input, setInput] = React.useState("");
    const [result, setResult] = React.useState<string>("");

    const handleInput = (value: string) => {
        if (result !== "") {
            setInput(result + value);
            setResult("");
        } else {
            setInput(input + value);
        }
    };

    const handleClear = () => {
        setInput("");
        setResult("");
    };

    const handleCalculate = () => {
        try {
            // Avoid using eval(). A safer approach is to parse and calculate.
            // This simple implementation handles chained operations but not operator precedence.
            let evalResult = new Function('return ' + input.replace(/[^-()\d/*+.]/g, ''))();
            setResult(String(evalResult));
        } catch (e) {
            setResult("Error");
        }
    };
    
    const renderButton = (value: string, handler: (val: string) => void, className: string = "") => (
        <Button variant="outline" className={`text-xl font-bold h-14 ${className}`} onClick={() => handler(value)}>
            {value}
        </Button>
    )

    return (
        <Card>
            <CardHeader>
                <CardTitle>ቀላል ማስያ</CardTitle>
                <CardDescription>ለፈጣን ስሌቶች ይጠቀሙ።</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="p-4 bg-muted rounded-md text-right h-16 flex items-center justify-end">
                    <p className="text-3xl font-mono text-foreground truncate">
                       {result || input || "0"}
                    </p>
                 </div>
                <div className="grid grid-cols-4 gap-2">
                    {renderButton("C", () => handleClear(), "col-span-2 bg-destructive/20 text-destructive")}
                    {renderButton("/", handleInput)}
                    {renderButton("*", handleInput)}

                    {renderButton("7", handleInput)}
                    {renderButton("8", handleInput)}
                    {renderButton("9", handleInput)}
                    {renderButton("-", handleInput)}
                    
                    {renderButton("4", handleInput)}
                    {renderButton("5", handleInput)}
                    {renderButton("6", handleInput)}
                    {renderButton("+", handleInput)}

                    <div className="grid grid-rows-2 grid-cols-3 col-span-3 gap-2">
                        {renderButton("1", handleInput, "col-start-1")}
                        {renderButton("2", handleInput)}
                        {renderButton("3", handleInput)}
                        {renderButton("0", handleInput, "col-span-2")}
                        {renderButton(".", handleInput)}
                    </div>
                    {renderButton("=", () => handleCalculate(), "row-span-2 h-full bg-primary/20 text-primary")}
                </div>
            </CardContent>
        </Card>
    )
}


export function CreativeCalculator({ isOpen, onOpenChange, form }: { isOpen: boolean, onOpenChange: (open: boolean) => void, form: UseFormReturn<StrategicPlanFormValues>}) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <BrainCircuit className="h-8 w-8 text-primary" />
            <div>
              <DialogTitle className="text-2xl font-headline">የፈጠራ ማስያ</DialogTitle>
              <DialogDescription>
                በጀትዎን እና ክብደትዎን ለማስተዳደር የሚረዱ መሳሪያዎች።
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="py-4">
          <Tabs defaultValue="budget">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="budget">የበጀት ማስያ</TabsTrigger>
              <TabsTrigger value="objectives">የዓላማ ክብደት</TabsTrigger>
              <TabsTrigger value="actions">የእርምጃ ክብደት</TabsTrigger>
              <TabsTrigger value="simple-calc">ቀላል ማስያ</TabsTrigger>
            </TabsList>
            <TabsContent value="budget" className="pt-4">
              <BudgetCalculator form={form} />
            </TabsContent>
            <TabsContent value="objectives" className="pt-4">
                <WeightBalancer
                    title="የዓላማ ክብደት ማመጣጠኛ"
                    description="የሁሉም ዓላማዎችዎ ጠቅላላ ክብደት 100% መሆኑን ያረጋግጡ።"
                    form={form}
                    fieldArrayName="objectives"
                    weightFieldName="objectives.0.objectiveWeight" // Placeholder, not used directly
                />
            </TabsContent>
            <TabsContent value="actions" className="pt-4">
                <WeightBalancer
                    title="የስትራቴጂክ እርምጃ ክብደት ማመጣጠኛ"
                    description="የሁሉም ስትራቴጂክ እርምጃዎችዎ ጠቅላላ ክብደት 100% መሆኑን ያረጋግጡ።"
                    form={form}
                    fieldArrayName="objectives.0.strategicActions" // Placeholder
                    weightFieldName="objectives.0.strategicActions.0.weight" // Placeholder
                />
            </TabsContent>
            <TabsContent value="simple-calc" className="pt-4">
                <SimpleCalculator />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
