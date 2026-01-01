import { useState } from 'react';
import { Drawer } from 'vaul';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { MapPin, ChevronRight, Check } from 'lucide-react';
import { getWilayas, getCommunesByWilaya, type Wilaya, type Commune } from '@/constants/algeria-data';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface LocationPickerProps {
    value?: string;
    onChange: (wilaya: string) => void;
    placeholder?: string;
}

export const LocationPicker = ({ value, onChange, placeholder = "اختر الولاية" }: LocationPickerProps) => {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const wilayas = getWilayas();

    const handleWilayaSelect = (wilaya: Wilaya) => {
        onChange(wilaya.ar_name);
        setOpen(false);
        setSearchQuery('');
    };

    const displayValue = value || placeholder;

    if (isMobile) {
        return (
            <div className="space-y-4" dir="rtl">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground mr-1">الولاية</label>
                    <div className="relative">
                        <select
                            className="w-full h-12 rounded-xl border border-input bg-background px-4 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none transition-all"
                            value={value || ''}
                            onChange={(e) => {
                                const wilaya = wilayas.find(w => w.ar_name === e.target.value);
                                if (wilaya) {
                                    onChange(wilaya.ar_name);
                                }
                            }}
                        >
                            <option value="">-- اختر الولاية --</option>
                            {wilayas.map((wilaya) => (
                                <option key={wilaya.code} value={wilaya.ar_name}>
                                    {wilaya.code} - {wilaya.ar_name}
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
                    className="w-full justify-start text-right h-12 font-normal"
                    dir="rtl"
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
                        {/* Handle */}
                        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-4" />

                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <Drawer.Title className="text-xl font-bold flex-1 text-center">
                                اختر الولاية
                            </Drawer.Title>
                        </div>

                        {/* Search Command */}
                        <Command className="rounded-xl border shadow-md flex-1 flex flex-col overflow-hidden">
                            <CommandInput
                                placeholder="ابحث عن الولاية..."
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
                                    {wilayas.map((wilaya) => (
                                        <CommandItem
                                            key={wilaya.code}
                                            value={`${wilaya.ar_name} ${wilaya.name}`}
                                            onSelect={() => handleWilayaSelect(wilaya)}
                                            className="flex items-center justify-between py-4 px-4 cursor-pointer hover:bg-accent rounded-lg my-1"
                                            dir="rtl"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {wilaya.code}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-base">{wilaya.ar_name}</span>
                                                    <span className="text-xs text-muted-foreground">{wilaya.name}</span>
                                                </div>
                                            </div>
                                            {value === wilaya.ar_name && (
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

export default LocationPicker;
