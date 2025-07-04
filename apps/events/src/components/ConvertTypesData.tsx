import { useState } from 'react';
import { generateMappingFile, generateSchemaFile } from '../utils/convertTypesData';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const ConvertTypesData = () => {
  const [schemaOutput, setSchemaOutput] = useState<string>('');
  const [mappingOutput, setMappingOutput] = useState<string>('');

  const handleGenerateSchema = () => {
    const schema = generateSchemaFile();
    setSchemaOutput(schema);
  };

  const handleGenerateMapping = () => {
    const mapping = generateMappingFile();
    setMappingOutput(mapping);
  };

  const handleGenerateBoth = () => {
    handleGenerateSchema();
    handleGenerateMapping();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={handleGenerateSchema}>Generate Schema</Button>
        <Button onClick={handleGenerateMapping}>Generate Mapping</Button>
        <Button onClick={handleGenerateBoth}>Generate Both</Button>
      </div>

      {schemaOutput && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Schema</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">{schemaOutput}</pre>
          </CardContent>
        </Card>
      )}

      {mappingOutput && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Mapping</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">{mappingOutput}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
