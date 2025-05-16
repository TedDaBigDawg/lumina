'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PaymentType, PaymentCategory } from '@prisma/client'
import { createPayment, getActivePaymentGoals, getPaymentGoalById } from '@/actions/payment-actions'
import { useToast } from '@/hooks/use-toast'

type PaymentGoal = {
  id: string
  title: string
  description: string
  category: PaymentCategory
  targetAmount: number
  currentAmount: number
  startDate: Date
  endDate: Date | null
}

export default function NewPaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  // Get payment type from URL query parameters
  const typeFromUrl = searchParams.get('type') as PaymentType | null
  const [paymentType, setPaymentType] = useState<PaymentType>(typeFromUrl || 'DONATION')
  const [paymentGoals, setPaymentGoals] = useState<PaymentGoal[]>([])
  const [selectedGoalId, setSelectedGoalId] = useState<string>('none')
  const [isLoading, setIsLoading] = useState(false)
  
  // Update payment type when URL changes
  useEffect(() => {
    if (typeFromUrl && (typeFromUrl === 'DONATION' || typeFromUrl === 'OFFERING')) {
      setPaymentType(typeFromUrl)
    }
  }, [typeFromUrl])
  
  // Fetch payment goals when type is DONATION
  useEffect(() => {
    async function fetchGoals() {
      if (paymentType === 'DONATION') {
        try {
          const goals = await getActivePaymentGoals()
          setPaymentGoals(goals)
          
          // Check if goalId is in URL query
          const goalIdFromQuery = searchParams.get('goalId')
          if (goalIdFromQuery) {
            setSelectedGoalId(goalIdFromQuery)
          }
          
          // Check if category is in URL query
          const categoryFromQuery = searchParams.get('category')
          if (categoryFromQuery) {
            // This will be handled by the form directly
          }
        } catch (error) {
          console.error('Failed to fetch payment goals:', error)
          toast({
            title: 'Error',
            description: 'Failed to load donation goals',
            variant: 'destructive',
          })
        }
      }
    }
    
    fetchGoals()
  }, [paymentType, searchParams, toast])
  
  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    
    try {
      // Set the payment type
      formData.set('type', paymentType)
      
      // Add the goalId to formData if it's a donation with a selected goal
      if (paymentType === 'DONATION' && selectedGoalId && selectedGoalId !== 'none') {
        formData.set('goalId', selectedGoalId)
      }
      
      const result = await createPayment(formData)
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Payment created successfully',
        })
        router.push('/dashboard/payments')
        router.refresh()
      } else {
        throw new Error(result.error || 'Failed to create payment')
      }
    } catch (error) {
      console.error('Payment submission error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create payment',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>
            {paymentType === 'DONATION' ? 'Make a Donation' : 'Make an Offering'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (NGN)</Label>
              <Input 
                type="number" 
                name="amount" 
                id="amount" 
                step="0.01" 
                min="0.01" 
                required 
                placeholder="0.00"
                className="bg-white dark:bg-gray-800"
              />
            </div>
            
            {paymentType === 'DONATION' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="goalId">Donation Goal (Optional)</Label>
                  <Select 
                    name="goalId" 
                    value={selectedGoalId}
                    onValueChange={setSelectedGoalId}
                  >
                    <SelectTrigger className="w-full bg-white dark:bg-gray-800">
                      <SelectValue placeholder="Select a donation goal (optional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800">
                      <SelectItem value="none" className="text-gray-900 dark:text-gray-100">No specific goal</SelectItem>
                      {paymentGoals.map((goal) => (
                        <SelectItem 
                          key={goal.id} 
                          value={goal.id}
                          className="text-gray-900 dark:text-gray-100"
                        >
                          {goal.title} - ${goal.targetAmount.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {selectedGoalId !== 'none' && paymentGoals.find(g => g.id === selectedGoalId) && (
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-md text-sm text-gray-700 dark:text-gray-300">
                      <p className="font-medium">
                        Progress: ${paymentGoals.find(g => g.id === selectedGoalId)?.currentAmount.toFixed(2)} of ${paymentGoals.find(g => g.id === selectedGoalId)?.targetAmount.toFixed(2)}
                      </p>
                      <p className="mt-1">
                        {paymentGoals.find(g => g.id === selectedGoalId)?.description}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category (Optional)</Label>
                  <Select 
                    name="category"
                    defaultValue={searchParams.get('category') || undefined}
                  >
                    <SelectTrigger className="w-full bg-white dark:bg-gray-800">
                      <SelectValue placeholder="Select a category (optional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800">
                      <SelectItem value="TITHE" className="text-gray-900 dark:text-gray-100">Tithe</SelectItem>
                      <SelectItem value="OFFERING" className="text-gray-900 dark:text-gray-100">Offering</SelectItem>
                      <SelectItem value="SPECIAL_PROJECT" className="text-gray-900 dark:text-gray-100">Special Project</SelectItem>
                      <SelectItem value="OTHER" className="text-gray-900 dark:text-gray-100">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea 
                name="description" 
                id="description" 
                placeholder={paymentType === 'DONATION' 
                  ? "Add any additional details about your donation" 
                  : "Add any additional details about your offering"}
                className="bg-white dark:bg-gray-800"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : paymentType === 'DONATION' ? 'Complete Donation' : 'Complete Offering'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}