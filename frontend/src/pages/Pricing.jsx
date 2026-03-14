import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { 
  Check, X, Star, Zap, Crown, Building2, 
  ArrowRight, Sparkles, GraduationCap
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState('monthly');

  const studentPlans = [
    {
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      description: 'Get started with basic features',
      icon: Sparkles,
      color: 'from-slate-500 to-slate-600',
      features: [
        { name: '10 AI questions per day', included: true },
        { name: 'Access to free past papers', included: true },
        { name: 'Basic study notes', included: true },
        { name: 'School chat access', included: true },
        { name: 'Unlimited AI questions', included: false },
        { name: 'Premium past papers', included: false },
        { name: 'Voice explanations', included: false },
        { name: 'Tutor marketplace', included: false },
        { name: 'Performance analytics', included: false }
      ]
    },
    {
      name: 'Premium',
      price: { monthly: 499, yearly: 4490 },
      description: 'Full access for serious students',
      icon: Star,
      color: 'from-blue-500 to-indigo-600',
      popular: true,
      features: [
        { name: '10 AI questions per day', included: true },
        { name: 'Access to free past papers', included: true },
        { name: 'Basic study notes', included: true },
        { name: 'School chat access', included: true },
        { name: 'Unlimited AI questions', included: true },
        { name: 'Premium past papers', included: true },
        { name: 'Voice explanations', included: true },
        { name: 'Tutor marketplace', included: true },
        { name: 'Performance analytics', included: true }
      ]
    }
  ];

  const schoolPlans = [
    {
      name: 'Basic',
      price: { monthly: 2, yearly: 20 },
      unit: 'per student/month',
      description: 'Essential tools for small schools',
      icon: Building2,
      color: 'from-emerald-500 to-green-600',
      features: [
        { name: 'Student & teacher accounts', included: true },
        { name: 'Assignment management', included: true },
        { name: 'AI auto-grading', included: true },
        { name: 'Basic analytics', included: true },
        { name: 'Share notes across school', included: true },
        { name: 'Cross-school content', included: false },
        { name: 'Advanced analytics', included: false },
        { name: 'Parent portal', included: false },
        { name: 'Custom branding', included: false }
      ]
    },
    {
      name: 'Premium',
      price: { monthly: 5, yearly: 48 },
      unit: 'per student/month',
      description: 'Complete solution for growing schools',
      icon: Crown,
      color: 'from-violet-500 to-purple-600',
      popular: true,
      features: [
        { name: 'Student & teacher accounts', included: true },
        { name: 'Assignment management', included: true },
        { name: 'AI auto-grading', included: true },
        { name: 'Basic analytics', included: true },
        { name: 'Share notes across school', included: true },
        { name: 'Cross-school content', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'Parent portal', included: true },
        { name: 'Custom branding', included: true }
      ]
    }
  ];

  const faqs = [
    {
      question: 'Can I switch plans later?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.'
    },
    {
      question: 'Is there a free trial for premium?',
      answer: 'Yes! All new users get a 7-day free trial of Premium features. No credit card required.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept M-Pesa, Airtel Money, bank cards, and bank transfers for convenience.'
    },
    {
      question: 'Can schools pay for individual students?',
      answer: "Yes, schools can subscribe on behalf of their students through the school's admin portal."
    },
    {
      question: 'Do you offer discounts for multiple schools?',
      answer: 'Yes, we offer volume discounts for education groups managing multiple schools. Contact us for details.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero */}
      <section className="relative py-20 px-4 lg:px-8 overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">
            Simple, transparent pricing
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Choose the plan that fits your needs
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Start free and upgrade as you grow. No hidden fees, cancel anytime.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 bg-white rounded-full p-2 shadow-lg border border-slate-200">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingPeriod === 'yearly'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Yearly
              <Badge className="ml-2 bg-green-100 text-green-700 text-xs">Save 25%</Badge>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Tabs */}
      <section className="py-12 px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="students" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
              <TabsTrigger value="students" className="text-base">For Students</TabsTrigger>
              <TabsTrigger value="schools" className="text-base">For Schools</TabsTrigger>
            </TabsList>

            <TabsContent value="students">
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {studentPlans.map((plan, index) => (
                  <motion.div
                    key={plan.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`relative h-full ${
                      plan.popular ? 'border-blue-500 border-2 shadow-xl' : 'border-slate-200'
                    }`}>
                      {plan.popular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                          <Badge className="bg-blue-600 text-white px-4">Most Popular</Badge>
                        </div>
                      )}
                      <CardHeader className="text-center pt-8">
                        <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mx-auto mb-4`}>
                          <plan.icon className="h-7 w-7 text-white" />
                        </div>
                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                        <div className="mt-4">
                          <span className="text-5xl font-bold text-slate-900">
                            KES {plan.price[billingPeriod].toLocaleString()}
                          </span>
                          {plan.price[billingPeriod] > 0 && (
                            <span className="text-slate-500">/{billingPeriod === 'monthly' ? 'mo' : 'yr'}</span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pb-8">
                        <ul className="space-y-3 mb-8">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-3">
                              {feature.included ? (
                                <Check className="h-5 w-5 text-green-500" />
                              ) : (
                                <X className="h-5 w-5 text-slate-300" />
                              )}
                              <span className={feature.included ? 'text-slate-700' : 'text-slate-400'}>
                                {feature.name}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <Link to={createPageUrl('Register')}>
                          <Button 
                            className={`w-full ${
                              plan.popular 
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' 
                                : ''
                            }`}
                            variant={plan.popular ? 'default' : 'outline'}
                          >
                            {plan.price[billingPeriod] === 0 ? 'Get Started Free' : 'Start Free Trial'}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="schools">
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {schoolPlans.map((plan, index) => (
                  <motion.div
                    key={plan.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`relative h-full ${
                      plan.popular ? 'border-violet-500 border-2 shadow-xl' : 'border-slate-200'
                    }`}>
                      {plan.popular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                          <Badge className="bg-violet-600 text-white px-4">Most Popular</Badge>
                        </div>
                      )}
                      <CardHeader className="text-center pt-8">
                        <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mx-auto mb-4`}>
                          <plan.icon className="h-7 w-7 text-white" />
                        </div>
                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                        <div className="mt-4">
                          <span className="text-5xl font-bold text-slate-900">
                            KES {plan.price[billingPeriod]}
                          </span>
                          <p className="text-slate-500 text-sm mt-1">{plan.unit}</p>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-8">
                        <ul className="space-y-3 mb-8">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-3">
                              {feature.included ? (
                                <Check className="h-5 w-5 text-green-500" />
                              ) : (
                                <X className="h-5 w-5 text-slate-300" />
                              )}
                              <span className={feature.included ? 'text-slate-700' : 'text-slate-400'}>
                                {feature.name}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <Link to={createPageUrl('SchoolRegister')}>
                          <Button 
                            className={`w-full ${
                              plan.popular 
                                ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' 
                                : ''
                            }`}
                            variant={plan.popular ? 'default' : 'outline'}
                          >
                            Register School
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-slate-200">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-2">{faq.question}</h3>
                    <p className="text-slate-600">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-12 text-center overflow-hidden">
            <div className="relative">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to start learning?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join thousands of students achieving their academic goals
              </p>
              <Link to={createPageUrl('Register')}>
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 h-14 px-8 text-lg">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}