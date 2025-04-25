"use client";

import React, { useState, useEffect } from "react";

import { X, Plus, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type RelationFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (relation: {
    id?: string;
    source_id: string;
    target_id: string;
    type: string;
    properties: Record<string, unknown>;
  }) => void;
  initialRelation?: {
    id?: string;
    source_id: string;
    target_id: string;
    type: string;
    properties: Record<string, unknown>;
  };
  availableEntities: Array<{
    id: string;
    name: string;
    type: string;
  }>;
};

export const RelationForm: React.FC<RelationFormProps> = ({
  isOpen,
  onClose,
  onSave,
  initialRelation,
  availableEntities,
}) => {
  const [relationId, setRelationId] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [relationType, setRelationType] = useState("has");
  const [properties, setProperties] = useState<Array<{ key: string; value: string }>>([
    { key: "", value: "" },
  ]);

  // Reset form when opened or when initialRelation changes
  useEffect(() => {
    if (isOpen) {
      if (initialRelation) {
        setRelationId(initialRelation.id || "");
        setSourceId(initialRelation.source_id);
        setTargetId(initialRelation.target_id);
        setRelationType(initialRelation.type);

        // Convert properties object to array of key-value pairs
        const propsArray = Object.entries(initialRelation.properties || {}).map(([key, value]) => ({
          key,
          value: String(value),
        }));

        setProperties(propsArray.length > 0 ? propsArray : [{ key: "", value: "" }]);
      } else {
        // Reset form for new relation
        setRelationId("");
        setSourceId(availableEntities.length > 0 ? availableEntities[0].id : "");
        setTargetId(availableEntities.length > 1 ? availableEntities[1].id : "");
        setRelationType("has");
        setProperties([{ key: "", value: "" }]);
      }
    }
  }, [isOpen, initialRelation, availableEntities]);

  const handleAddProperty = () => {
    setProperties([...properties, { key: "", value: "" }]);
  };

  const handleRemoveProperty = (index: number) => {
    const newProperties = [...properties];
    newProperties.splice(index, 1);
    setProperties(newProperties.length > 0 ? newProperties : [{ key: "", value: "" }]);
  };

  const handlePropertyChange = (index: number, field: "key" | "value", value: string) => {
    const newProperties = [...properties];
    newProperties[index][field] = value;
    setProperties(newProperties);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert properties array to object
    const propertiesObject = properties.reduce((acc, { key, value }) => {
      if (key.trim()) {
        acc[key.trim()] = value;
      }
      return acc;
    }, {} as Record<string, string>);

    onSave({
      id: relationId || undefined,
      source_id: sourceId,
      target_id: targetId,
      type: relationType,
      properties: propertiesObject,
    });

    onClose();
  };

  if (!isOpen) return null;

  // Get entity names for display
  const getEntityName = (id: string) => {
    const entity = availableEntities.find(e => e.id === id);
    return entity ? entity.name : id;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in-up">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">
            {initialRelation ? "Edit Relation" : "Add New Relation"}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="source-entity">
                Source Entity <span className="text-destructive">*</span>
              </Label>
              <Select value={sourceId} onValueChange={setSourceId}>
                <SelectTrigger id="source-entity">
                  <SelectValue placeholder="Select source entity" />
                </SelectTrigger>
                <SelectContent>
                  {availableEntities.map((entity) => (
                    <SelectItem key={entity.id} value={entity.id}>
                      {entity.name} ({entity.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="relation-type">
                Relation Type <span className="text-destructive">*</span>
              </Label>
              <Select value={relationType} onValueChange={setRelationType}>
                <SelectTrigger id="relation-type">
                  <SelectValue placeholder="Select relation type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="has">has</SelectItem>
                  <SelectItem value="is_a">is a</SelectItem>
                  <SelectItem value="part_of">part of</SelectItem>
                  <SelectItem value="related_to">related to</SelectItem>
                  <SelectItem value="located_in">located in</SelectItem>
                  <SelectItem value="works_for">works for</SelectItem>
                  <SelectItem value="knows">knows</SelectItem>
                  <SelectItem value="created">created</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-entity">
                Target Entity <span className="text-destructive">*</span>
              </Label>
              <Select value={targetId} onValueChange={setTargetId}>
                <SelectTrigger id="target-entity">
                  <SelectValue placeholder="Select target entity" />
                </SelectTrigger>
                <SelectContent>
                  {availableEntities.map((entity) => (
                    <SelectItem key={entity.id} value={entity.id}>
                      {entity.name} ({entity.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {sourceId && targetId && (
              <div className="p-3 bg-muted rounded-md text-sm">
                <span className="font-medium">{getEntityName(sourceId)}</span>
                <span className="mx-2 text-muted-foreground">{relationType}</span>
                <span className="font-medium">{getEntityName(targetId)}</span>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Properties</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAddProperty}
                  className="h-8 text-xs"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Property
                </Button>
              </div>

              <div className="space-y-2">
                {properties.map((prop, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      value={prop.key}
                      onChange={(e) =>
                        handlePropertyChange(index, "key", e.target.value)
                      }
                      placeholder="Key"
                      className="w-1/3"
                    />
                    <Input
                      value={prop.value}
                      onChange={(e) =>
                        handlePropertyChange(index, "value", e.target.value)
                      }
                      placeholder="Value"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveProperty(index)}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!sourceId || !targetId || !relationType}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Relation
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
