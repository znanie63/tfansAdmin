import { X } from 'lucide-react';
import { FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface CharacteristicsProps {
  characteristics: Array<{ key: string; value: string }>;
  setCharacteristics: (chars: Array<{ key: string; value: string }>) => void;
}

export function Characteristics({ characteristics, setCharacteristics }: CharacteristicsProps) {
  const addCharacteristic = () => {
    setCharacteristics([...characteristics, { key: '', value: '' }]);
  };

  const removeCharacteristic = (index: number) => {
    setCharacteristics(characteristics.filter((_, i) => i !== index));
  };

  const updateCharacteristic = (index: number, field: 'key' | 'value', value: string) => {
    const newCharacteristics = [...characteristics];
    newCharacteristics[index][field] = value;
    setCharacteristics(newCharacteristics);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FormLabel>Custom Characteristics (Optional)</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addCharacteristic}
        >
          Add Characteristic
        </Button>
      </div>
      {characteristics.map((char, index) => (
        <div key={index} className="flex gap-4">
          <Input
            placeholder="Name (e.g. Eye Color)"
            value={char.key}
            onChange={(e) => updateCharacteristic(index, 'key', e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="Value (e.g. Blue)"
            value={char.value}
            onChange={(e) => updateCharacteristic(index, 'value', e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeCharacteristic(index)}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}