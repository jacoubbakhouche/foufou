import { useState, useEffect } from 'react';
import { Drawer } from 'vaul';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { MapPin, ChevronRight, Check } from 'lucide-react';
import { getWilayas, getCommunesByWilaya, type Wilaya, type Commune } from '@/constants/algeria-data';
import { cn } from '@/lib/utils';

interface CommunePickerProps {
    wilayaName?: string;
    value?: string;
    onChange: (commune: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export const CommunePicker = ({ wilayaName, value, onChange, placeholder = "اختر البلدية", disabled = false }: CommunePickerProps) => {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const [communes, setCommunes] = useState<Commune[]>([]);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (wilayaName) {
            const wilaya = getWilayas().find(w => w.ar_name === wilayaName || w.name === wilayaName);
            if (wilaya) {
                setCommunes(getCommunesByWilaya(wilaya.code));
            } else {
                setCommunes([]);
            }
        } else {
            setCommunes([]);
        }
    }, [wilayaName]);

    const handleCommuneSelect = (commune: Commune) => {
        onChange(commune.ar_name);
        setOpen(false);
        setSearchQuery('');
    };

    const displayValue = value || placeholder;

    if (isMobile) {
        return (
            <div className="space-y-4" dir="rtl">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground mr-1">البلدية</label>
                    <div className="relative">
                        <select
                            className="w-full h-12 rounded-xl border border-input bg-background px-4 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            value={value || ''}
                            onChange={(e) => {
                                const commune = communes.find(c => c.ar_name === e.target.value);
                                if (commune) {
                                    onChange(commune.ar_name);
                                }
                            }}
                            disabled={disabled || communes.length === 0}
                        >
                            <option value="">-- اختر البلدية --</option>
                            {communes.map((commune) => (
                                <option key={commune.code} value={commune.ar_name}>
                                    {commune.ar_name}
                                </option>
                            ))}
                        </select>
                        <ChevronRight className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground rotate-180 pointer-events-none" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Drawer.Root open={open} onOpenChange={setOpen}>
            <Drawer.Trigger asChild>
                <Button
                    variant="outline"
                    className="w-full justify-start text-right h-12 font-normal disabled:opacity-50 disabled:cursor-not-allowed"
                    dir="rtl"
                    disabled={disabled || communes.length === 0}
                >
                    <MapPin className="ml-2 h-4 w-4 text-muted-foreground" />
                    <span className={cn(!value && "text-muted-foreground")}>
                        {displayValue}
                    </span>
                </Button>
            </Drawer.Trigger>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
                <Drawer.Content className="bg-background flex flex-col rounded-t-[24px] h-[85vh] mt-24 fixed bottom-0 left-0 right-0 z-50 shadow-2xl">
                    <div className="p-4 bg-background rounded-t-[24px] flex-1 flex flex-col">
                        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-4" />
                        <div className="flex items-center justify-between mb-4">
                            <Drawer.Title className="text-xl font-bold flex-1 text-center">
                                اختر البلدية
                            </Drawer.Title>
                        </div>
                        <Command className="rounded-xl border shadow-md flex-1 flex flex-col overflow-hidden">
                            <CommandInput
                                placeholder="ابحث عن البلدية..."
                                value={searchQuery}
                                onValueChange={setSearchQuery}
                                className="h-12 text-base"
                                dir="rtl"
                            />
                            <CommandList className="max-h-none flex-1 overflow-y-auto">
                                <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                                    لا توجد نتائج
                                </CommandEmpty>
                                <CommandGroup>
                                    {communes.map((commune) => (
                                        <CommandItem
                                            key={commune.code}
                                            value={`${commune.ar_name} ${commune.name}`}
                                            onSelect={() => handleCommuneSelect(commune)}
                                            className="flex items-center justify-between py-4 px-4 cursor-pointer hover:bg-accent rounded-lg my-1"
                                            dir="rtl"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-base">{commune.ar_name}</span>
                                                    <span className="text-xs text-muted-foreground">{commune.name}</span>
                                                </div>
                                            </div>
                                            {value === commune.ar_name && (
                                                <Check className="h-5 w-5 text-primary" />
                                            )}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
};

export default CommunePicker;
