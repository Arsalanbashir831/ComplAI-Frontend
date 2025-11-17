'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TokenPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (cost: number) => void;
}

const MIN_AMOUNT = 50;
const CREDITS_PER_POUND = 3;

export function TokenPurchaseModal({
  isOpen,
  onClose,
  onPurchase,
}: TokenPurchaseModalProps) {
  const [amount, setAmount] = useState<string>('50');
  const [error, setError] = useState<string | null>(null);

  // Set default value when modal opens
  useEffect(() => {
    if (isOpen) {
      // Force set the amount to ensure it's always '50' when modal opens
      setAmount('50');
      setError(null);
    }
  }, [isOpen]);

  // Calculate credits based on amount
  const numericAmount = parseFloat(amount) || 0;
  const credits = numericAmount * CREDITS_PER_POUND;
  const isValid = numericAmount >= MIN_AMOUNT;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow empty input or valid decimal numbers
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setError(null);
    }
  };

  const handlePurchase = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < MIN_AMOUNT) {
      setError(`Minimum purchase amount is £${MIN_AMOUNT}`);
      return;
    }
    onPurchase(numAmount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-blue-800">
            Purchase Tokens
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Enter the amount you want to spend. Minimum purchase is £
            {MIN_AMOUNT}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label
              htmlFor="amount"
              className="text-sm font-medium text-gray-700"
            >
              Amount (£)
            </Label>
            <Input
              id="amount"
              type="text"
              inputMode="decimal"
              placeholder={`Minimum £${MIN_AMOUNT}`}
              value={amount}
              onChange={handleAmountChange}
              className={cn(
                'w-full',
                error && 'border-red-500 focus-visible:ring-red-500'
              )}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <p className="text-xs text-gray-500">
              Minimum purchase: £{MIN_AMOUNT}
            </p>
          </div>

          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                You will receive:
              </span>
              <span className="text-2xl font-bold text-blue-800">
                {credits.toFixed(1)} credits
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Calculation: £{numericAmount || 0} × {CREDITS_PER_POUND} ={' '}
              {credits.toFixed(1)} credits
            </p>
          </div>
        </div>

        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handlePurchase}
            disabled={!isValid || !amount}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Purchase
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
