"use client";

import React, { useState, useEffect } from "react";

import { X, Plus, Save } from "lucide-react";

type EntityFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entity: {
    id: string;
    name: string;
    type: string;
    properties: Record<string, unknown>;
  }) => void;
  initialEntity?: {
    id: string;
    name: string;
    type: string;
    properties: Record<string, unknown>;
  };
};

export const EntityForm: React.FC<EntityFormProps> = ({
  isOpen,
  onClose,
  onSave,
  initialEntity,
}) => {
  const [entityId, setEntityId] = useState("");
  const [entityName, setEntityName] = useState("");
  const [entityType, setEntityType] = useState("concept");
  const [properties, setProperties] = useState<Array<{ key: string; value: string }>>([
    { key: "", value: "" },
  ]);

  // Reset form when opened or when initialEntity changes
  useEffect(() => {
    if (isOpen) {
      if (initialEntity) {
        setEntityId(initialEntity.id);
        setEntityName(initialEntity.name);
        setEntityType(initialEntity.type);

        // Convert properties object to array of key-value pairs
        const propsArray = Object.entries(initialEntity.properties).map(([key, value]) => ({
          key,
          value: String(value),
        }));

        setProperties(propsArray.length > 0 ? propsArray : [{ key: "", value: "" }]);
      } else {
        // Reset form for new entity
        setEntityId("");
        setEntityName("");
        setEntityType("concept");
        setProperties([{ key: "", value: "" }]);
      }
    }
  }, [isOpen, initialEntity]);

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
      id: entityId || `entity-${Date.now()}`,
      name: entityName,
      type: entityType,
      properties: propertiesObject,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-semibold">
            {initialEntity ? "Edit Entity" : "Add New Entity"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1">
                Entity ID
              </label>
              <input
                type="text"
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                className="w-full px-2 py-1.5 border rounded-md text-sm"
                placeholder="e.g., person-123 (auto-generated if empty)"
                disabled={!!initialEntity}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                className="w-full px-2 py-1.5 border rounded-md text-sm"
                placeholder="e.g., John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value)}
                className="w-full px-2 py-1.5 border rounded-md text-sm"
                required
              >
                <option value="concept">Concept</option>
                <option value="person">Person</option>
                <option value="organization">Organization</option>
                <option value="location">Location</option>
                <option value="event">Event</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-medium">Properties</label>
                <button
                  type="button"
                  onClick={handleAddProperty}
                  className="text-blue-600 hover:text-blue-800 text-xs flex items-center"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Property
                </button>
              </div>

              <div className="space-y-1">
                {properties.map((prop, index) => (
                  <div key={index} className="flex gap-1">
                    <input
                      type="text"
                      value={prop.key}
                      onChange={(e) =>
                        handlePropertyChange(index, "key", e.target.value)
                      }
                      className="w-1/3 px-2 py-1 border rounded-md text-xs"
                      placeholder="Key"
                    />
                    <input
                      type="text"
                      value={prop.value}
                      onChange={(e) =>
                        handlePropertyChange(index, "value", e.target.value)
                      }
                      className="flex-1 px-2 py-1 border rounded-md text-xs"
                      placeholder="Value"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveProperty(index)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 border text-gray-700 rounded-md hover:bg-gray-50 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs font-medium flex items-center"
                disabled={!entityName}
              >
                <Save className="h-3 w-3 mr-1" />
                Save Entity
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
