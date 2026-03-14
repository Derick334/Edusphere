import { Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function GradingSettings({ settings, onChange }) {
  const {
    auto_approval_threshold = 80,
    flag_review_threshold = 50,
    plagiarism_check_enabled = true,
    plagiarism_threshold = 20
  } = settings;

  const updateSetting = (key, value) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          AI Grading Settings
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-slate-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Configure how AI grades submissions and when they require manual review</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Auto Approval Threshold */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Auto-Approval Threshold</Label>
              <p className="text-xs text-slate-500">
                Submissions scoring above this are automatically approved
              </p>
            </div>
            <span className="text-lg font-bold text-green-600">{auto_approval_threshold}%</span>
          </div>
          <Slider
            value={[auto_approval_threshold]}
            onValueChange={(v) => updateSetting('auto_approval_threshold', v[0])}
            max={100}
            min={0}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Flag Review Threshold */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Flag for Review Threshold</Label>
              <p className="text-xs text-slate-500">
                Submissions scoring below this are flagged for manual review
              </p>
            </div>
            <span className="text-lg font-bold text-orange-600">{flag_review_threshold}%</span>
          </div>
          <Slider
            value={[flag_review_threshold]}
            onValueChange={(v) => updateSetting('flag_review_threshold', v[0])}
            max={100}
            min={0}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Visual indicator */}
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-sm font-medium mb-3">Grading Zones</p>
          <div className="relative h-6 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 bottom-0 bg-red-400"
              style={{ width: `${flag_review_threshold}%` }}
            />
            <div 
              className="absolute top-0 bottom-0 bg-orange-400"
              style={{ left: `${flag_review_threshold}%`, width: `${auto_approval_threshold - flag_review_threshold}%` }}
            />
            <div 
              className="absolute right-0 top-0 bottom-0 bg-green-400"
              style={{ width: `${100 - auto_approval_threshold}%` }}
            />
          </div>
          <div className="flex justify-between text-xs mt-2">
            <span className="text-red-600">Flagged</span>
            <span className="text-orange-600">Pending Review</span>
            <span className="text-green-600">Auto-Approved</span>
          </div>
        </div>

        {/* Plagiarism Settings */}
        <div className="border-t pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Plagiarism Detection</Label>
              <p className="text-xs text-slate-500">Check submissions for copied content</p>
            </div>
            <Switch
              checked={plagiarism_check_enabled}
              onCheckedChange={(v) => updateSetting('plagiarism_check_enabled', v)}
            />
          </div>

          {plagiarism_check_enabled && (
            <div className="space-y-3 pl-4 border-l-2 border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Plagiarism Threshold</Label>
                  <p className="text-xs text-slate-500">
                    Flag submissions with similarity above this percentage
                  </p>
                </div>
                <span className="text-lg font-bold text-red-600">{plagiarism_threshold}%</span>
              </div>
              <Slider
                value={[plagiarism_threshold]}
                onValueChange={(v) => updateSetting('plagiarism_threshold', v[0])}
                max={100}
                min={5}
                step={5}
                className="w-full"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}