import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function RubricBuilder({ rubric, onChange, assignmentType }) {
  const [criteria, setCriteria] = useState(rubric?.criteria || []);
  const [essayWeightings, setEssayWeightings] = useState(rubric?.essay_weightings || {
    content_accuracy: 40,
    structure_organization: 20,
    coherence_flow: 15,
    argumentation: 15,
    grammar_spelling: 10
  });

  const addCriterion = () => {
    const newCriteria = [...criteria, {
      id: Date.now(),
      name: '',
      description: '',
      max_points: 10,
      levels: [
        { score: 10, description: 'Excellent' },
        { score: 7, description: 'Good' },
        { score: 5, description: 'Satisfactory' },
        { score: 3, description: 'Needs Improvement' },
        { score: 0, description: 'Poor' }
      ]
    }];
    setCriteria(newCriteria);
    updateRubric(newCriteria, essayWeightings);
  };

  const updateCriterion = (index, field, value) => {
    const updated = [...criteria];
    updated[index] = { ...updated[index], [field]: value };
    setCriteria(updated);
    updateRubric(updated, essayWeightings);
  };

  const removeCriterion = (index) => {
    const updated = criteria.filter((_, i) => i !== index);
    setCriteria(updated);
    updateRubric(updated, essayWeightings);
  };

  const updateEssayWeighting = (key, value) => {
    const updated = { ...essayWeightings, [key]: value[0] };
    setEssayWeightings(updated);
    updateRubric(criteria, updated);
  };

  const updateRubric = (newCriteria, newWeightings) => {
    onChange({
      criteria: newCriteria,
      essay_weightings: newWeightings
    });
  };

  const totalEssayWeight = Object.values(essayWeightings).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Essay Weightings */}
      {(assignmentType === 'essay' || assignmentType === 'mixed') && (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Essay Grading Weightings</CardTitle>
            <p className="text-sm text-slate-500">
              Define how AI should weight different aspects of essay responses
              <span className={`ml-2 font-medium ${totalEssayWeight === 100 ? 'text-green-600' : 'text-red-600'}`}>
                (Total: {totalEssayWeight}%)
              </span>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'content_accuracy', label: 'Content Accuracy', desc: 'Correctness of facts, concepts, and information' },
              { key: 'structure_organization', label: 'Structure & Organization', desc: 'Logical flow, paragraphing, introduction/conclusion' },
              { key: 'coherence_flow', label: 'Coherence & Flow', desc: 'Smooth transitions, connected ideas' },
              { key: 'argumentation', label: 'Argumentation', desc: 'Quality of arguments, evidence, reasoning' },
              { key: 'grammar_spelling', label: 'Grammar & Spelling', desc: 'Language mechanics and presentation' }
            ].map(({ key, label, desc }) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">{label}</Label>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{essayWeightings[key]}%</span>
                </div>
                <Slider
                  value={[essayWeightings[key]]}
                  onValueChange={(v) => updateEssayWeighting(key, v)}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Custom Criteria */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Custom Grading Criteria</CardTitle>
              <p className="text-sm text-slate-500">Add specific criteria for AI to evaluate</p>
            </div>
            <Button onClick={addCriterion} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add Criterion
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {criteria.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>No custom criteria added yet</p>
              <p className="text-sm">Click "Add Criterion" to define specific grading requirements</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-2">
              {criteria.map((criterion, index) => (
                <AccordionItem key={criterion.id} value={`item-${index}`} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 text-slate-400" />
                      <span>{criterion.name || `Criterion ${index + 1}`}</span>
                      <span className="text-sm text-slate-500">({criterion.max_points} pts)</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Criterion Name</Label>
                        <Input
                          value={criterion.name}
                          onChange={(e) => updateCriterion(index, 'name', e.target.value)}
                          placeholder="e.g., Use of Examples"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Max Points</Label>
                        <Input
                          type="number"
                          value={criterion.max_points}
                          onChange={(e) => updateCriterion(index, 'max_points', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description (for AI)</Label>
                      <Textarea
                        value={criterion.description}
                        onChange={(e) => updateCriterion(index, 'description', e.target.value)}
                        placeholder="Describe what the AI should look for..."
                      />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600"
                      onClick={() => removeCriterion(index)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}