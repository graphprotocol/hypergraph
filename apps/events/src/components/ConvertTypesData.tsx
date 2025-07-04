import { useState } from 'react';
import { getTypesWithSchemaAndMapping } from '../utils/convertTypesData';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const ConvertTypesData = () => {
  const [isGenerated, setIsGenerated] = useState(false);
  const [typesData, setTypesData] = useState<ReturnType<typeof getTypesWithSchemaAndMapping>>([]);
  const [activeTab, setActiveTab] = useState<Record<string, 'schema' | 'mapping'>>({});

  const handleGenerate = () => {
    const data = getTypesWithSchemaAndMapping();
    console.log('data', JSON.stringify(data, null, 2));
    setTypesData(data);
    setIsGenerated(true);
    // Set default active tab to schema for all types
    const defaultTabs: Record<string, 'schema' | 'mapping'> = {};
    for (const typeData of data) {
      defaultTabs[typeData.id] = 'schema';
    }
    setActiveTab(defaultTabs);
  };

  const toggleTab = (typeId: string) => {
    setActiveTab((prev) => ({
      ...prev,
      [typeId]: prev[typeId] === 'schema' ? 'mapping' : 'schema',
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={handleGenerate}>Generate All Types</Button>
      </div>

      {isGenerated && (
        <div className="grid gap-4">
          {typesData.map((typeData) => (
            <Card key={typeData.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{typeData.name}</span>
                    <span className="text-sm text-gray-500 font-normal">({typeData.properties.length} properties)</span>
                  </div>
                  <span className="text-sm text-gray-500 font-normal">ID: {typeData.id}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      variant={activeTab[typeData.id] === 'schema' ? 'default' : 'outline'}
                      onClick={() => toggleTab(typeData.id)}
                      className="flex-1"
                    >
                      Schema
                    </Button>
                    <Button
                      variant={activeTab[typeData.id] === 'mapping' ? 'default' : 'outline'}
                      onClick={() => toggleTab(typeData.id)}
                      className="flex-1"
                    >
                      Mapping
                    </Button>
                  </div>

                  <div className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                    <pre className="whitespace-pre-wrap">
                      {activeTab[typeData.id] === 'mapping' ? typeData.mapping : typeData.schema}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
