import { zodResolver } from "@hookform/resolvers/zod";
import { Home, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mbdwoozl";

const leadFormSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
  phone: z
    .string()
    .min(8, "Informe um telefone para contato.")
    .max(30, "Use no máximo 30 caracteres."),
  address: z
    .string()
    .min(5, "Informe o endereço do imóvel.")
    .max(300, "Use no máximo 300 caracteres."),
  consent: z.boolean().refine((value) => value, {
    message: "Você precisa autorizar o contato.",
  }),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

function ContactFormButton({ children, className, variant = "default", size = "default" }: { children: React.ReactNode, className?: string, variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary", size?: "default" | "sm" | "lg" | "icon" }) {
  return (
    <Button asChild className={className} variant={variant} size={size}>
      <a href="#contato">
        {children}
      </a>
    </Button>
  );
}

function LeadCaptureForm() {
  const { toast } = useToast();
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      email: "",
      phone: "",
      address: "",
      consent: false,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: values.email.trim(),
          phone: values.phone.trim(),
          address: values.address.trim(),
          consent: values.consent,
          source: "Casa em Dia site",
        }),
      });

      if (!response.ok) {
        throw new Error("Não foi possível enviar sua solicitação agora. Tente novamente em alguns instantes.");
      }

      form.reset();
      toast({
        title: "Pedido de visita recebido.",
        description: "Vamos analisar o endereço enviado e retornar para confirmar a disponibilidade e os próximos passos.",
      });
    } catch (error) {
      toast({
        title: "Não foi possível enviar.",
        description:
          error instanceof Error
            ? error.message
            : "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  });

  return (
    <div className="w-full rounded-3xl border border-primary/10 bg-background p-6 text-foreground shadow-2xl md:p-8">
      <div className="mb-6 space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
          Agende sua visita
        </p>
        <h3 className="text-2xl font-bold tracking-tight">
          Envie os dados do imóvel e solicite o agendamento.
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Preencha e-mail, telefone e endereço. Usamos essas informações para validar o atendimento na sua região e organizar a visita.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="voce@exemplo.com"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    autoComplete="tel"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Rua, número, bairro e complemento"
                    autoComplete="street-address"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="consent"
            render={({ field }) => (
              <FormItem className="rounded-2xl border border-border/70 bg-secondary/30 p-4">
                <div className="flex items-start gap-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                      className="mt-1"
                    />
                  </FormControl>
                  <div className="space-y-1">
                    <FormLabel className="text-sm leading-5">
                      Autorizo o contato da Casa em Dia com base nos dados informados.
                    </FormLabel>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Usaremos esses dados apenas para responder sua solicitação e organizar o atendimento.
                    </p>
                    <FormMessage />
                  </div>
                </div>
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-3 pt-2">
            <Button type="submit" size="lg" className="h-12 w-full text-base" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Quero agendar minha visita"
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
                Depois do envio, nossa equipe confirma a área de atendimento e combina a melhor data.
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-bold text-xl">
            <Home className="h-6 w-6" />
            <span>Casa em Dia</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
            <a href="#como-funciona" className="hover:text-foreground transition-colors">Como funciona</a>
            <a href="#planos" className="hover:text-foreground transition-colors">Planos</a>
            <a href="#vantagens" className="hover:text-foreground transition-colors">Vantagens</a>
            <a href="#faq" className="hover:text-foreground transition-colors">Dúvidas</a>
          </nav>
          <ContactFormButton variant="default" className="hidden md:inline-flex">
            Agendar visita
          </ContactFormButton>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 md:pt-32 md:pb-48 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="/hero-bg.png" 
              alt="Casa limpa e ferramentas organizadas" 
              className="w-full h-full object-cover object-center opacity-20 dark:opacity-10"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background"></div>
          </div>
          
          <div className="container relative z-10 mx-auto px-4 md:px-6 flex flex-col items-center text-center">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              Atendendo Osasco e Região
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl mb-6 text-foreground animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
              A tranquilidade que a sua casa <span className="text-primary">merece.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              O seu vizinho de confiança, pronto para resolver os imprevistos do dia a dia. 
              Manutenção residencial preventiva e corretiva com preço fixo e sem dor de cabeça.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500">
              <ContactFormButton size="lg" className="text-base px-8 h-14">
                Agendar uma visita
              </ContactFormButton>
              <Button asChild variant="outline" size="lg" className="text-base px-8 h-14 bg-background/50 backdrop-blur-sm">
                <a href="#planos">Ver planos</a>
              </Button>
            </div>
          </div>
        </section>

        {/* O que fazemos */}
        <section id="como-funciona" className="py-20 md:py-32 bg-secondary/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row gap-12 md:gap-24 items-center">
              <div className="flex-1 space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">O que fazemos?</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Sabe aquela torneira pingando, a prateleira que você comprou e ainda não instalou, ou aquela lista de pequenos reparos que só cresce e nunca sai do papel? Nós cuidamos disso para você.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  A <strong>Casa em Dia</strong> oferece um serviço de assinatura de manutenção residencial. Você paga um valor mensal e tem a tranquilidade de contar com profissionais qualificados e de extrema confiança para manter sua casa sempre em dia — todo mês, sem surpresas.
                </p>
                <div className="pt-4">
                  <ContactFormButton variant="outline">Quero agendar uma conversa</ContactFormButton>
                </div>
              </div>
              <div className="flex-1 w-full relative">
                <div className="aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden bg-muted relative shadow-lg">
                  <img
                    src="/profissional-manutencao.png"
                    alt="Profissional realizando manutenção residencial"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                {/* Decorative element */}
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-accent/10 rounded-full blur-2xl"></div>
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Vantagens */}
        <section id="vantagens" className="py-20 md:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Por que escolher a Casa em Dia?</h2>
              <p className="text-lg text-muted-foreground">
                Nós transformamos a manutenção da sua casa de uma dor de cabeça em um processo simples e confiável.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: "Confiança",
                  desc: "Profissionais rigorosamente selecionados. Você sabe exatamente quem está entrando na sua casa."
                },
                {
                  title: "Rapidez",
                  desc: "Agendamento simples e atendimento ágil. Seus problemas resolvidos sem enrolação."
                },
                {
                  title: "Praticidade",
                  desc: "Uma única assinatura resolve diversos problemas. Chega de procurar um profissional diferente para cada reparo."
                },
                {
                  title: "Profissionais Qualificados",
                  desc: "Equipe treinada para realizar desde os reparos mais simples até os mais complexos com excelência."
                }
              ].map((item, i) => (
                <div key={i} className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 text-primary">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Planos */}
        <section id="planos" className="py-20 md:py-32 bg-foreground text-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Planos simples e transparentes</h2>
              <p className="text-lg text-background/80">
                Escolha a opção que melhor se adapta às necessidades da sua casa. Sem letras miúdas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Visita de Conhecimento */}
              <div className="bg-background/5 border border-background/10 rounded-2xl p-8 flex flex-col relative">
                <h3 className="text-xl font-semibold mb-2">Visita de Conhecimento</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">R$149</span>
                </div>
                <p className="text-background/70 mb-8 flex-1">
                  Ideal para quem quer testar nosso serviço antes de assumir um compromisso mensal.
                </p>
                <ul className="space-y-4 mb-8 text-sm">
                  <li className="flex gap-3">
                    <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    <span>Visita única com desconto</span>
                  </li>
                  <li className="flex gap-3">
                    <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    <span>Conheça nossa qualidade</span>
                  </li>
                </ul>
                <ContactFormButton variant="outline" className="w-full bg-transparent text-background border-background/20 hover:bg-background/10 hover:text-background">
                  Agendar Visita
                </ContactFormButton>
              </div>

              {/* Plano Mensal (Featured) */}
              <div className="bg-background rounded-2xl p-8 flex flex-col relative transform md:-translate-y-4 shadow-2xl text-foreground">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                    Mais Recomendado
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Plano Mensal</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">R$299</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <p className="text-muted-foreground mb-8 flex-1">
                  A tranquilidade de ter sua casa sempre em dia, sem surpresas no fim do mês.
                </p>
                <ul className="space-y-4 mb-8 text-sm">
                  <li className="flex gap-3">
                    <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    <span>1 visita mensal garantida</span>
                  </li>
                  <li className="flex gap-3">
                    <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    <span>Reparos residenciais variados</span>
                  </li>
                  <li className="flex gap-3">
                    <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    <span>Mão de obra inclusa</span>
                  </li>
                  <li className="flex gap-3 text-muted-foreground">
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    <span>Não inclui compra de peças</span>
                  </li>
                </ul>
                <ContactFormButton className="w-full text-base h-12">
                  Solicitar esse plano
                </ContactFormButton>
              </div>

              {/* Visita Adicional */}
              <div className="bg-background/5 border border-background/10 rounded-2xl p-8 flex flex-col relative">
                <h3 className="text-xl font-semibold mb-2">Visita Adicional</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">R$99</span>
                </div>
                <p className="text-background/70 mb-8 flex-1">
                  Exclusivo para assinantes. Para quando surgir aquele imprevisto entre as visitas mensais.
                </p>
                <ul className="space-y-4 mb-8 text-sm">
                  <li className="flex gap-3">
                    <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    <span>Visita extra fora do plano</span>
                  </li>
                  <li className="flex gap-3">
                    <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    <span>Atendimento prioritário</span>
                  </li>
                </ul>
                <ContactFormButton variant="outline" className="w-full bg-transparent text-background border-background/20 hover:bg-background/10 hover:text-background">
                  Solicitar Extra
                </ContactFormButton>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20 md:py-32 bg-secondary/30">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Dúvidas Frequentes</h2>
              <p className="text-lg text-muted-foreground">Tudo o que você precisa saber sobre nossos serviços.</p>
            </div>

            <Accordion type="single" collapsible className="w-full bg-card rounded-2xl border p-4 shadow-sm">
              <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger className="text-left text-lg font-medium px-4">O que está incluso na visita mensal?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground px-4 text-base leading-relaxed">
                  A visita mensal cobre a mão de obra para reparos residenciais variados de complexidade baixa a média. Isso inclui troca de resistências de chuveiro, conserto de vazamentos simples em torneiras e sifões, instalação de prateleiras, quadros, cortinas, troca de tomadas e interruptores, entre outros reparos do dia a dia.
                </AccordionContent>
              </AccordionItem>
              <div className="h-px bg-border mx-4"></div>
              <AccordionItem value="item-2" className="border-b-0">
                <AccordionTrigger className="text-left text-lg font-medium px-4">Qual é a área de atendimento?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground px-4 text-base leading-relaxed">
                  Atualmente atendemos toda a cidade de Osasco e municípios vizinhos na Grande São Paulo (Barueri, Carapicuíba, Itapevi e bairros da zona oeste da capital). Entre em contato para confirmar a disponibilidade no seu CEP.
                </AccordionContent>
              </AccordionItem>
              <div className="h-px bg-border mx-4"></div>
              <AccordionItem value="item-3" className="border-b-0">
                <AccordionTrigger className="text-left text-lg font-medium px-4">Como funciona a compra de materiais?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground px-4 text-base leading-relaxed">
                  Nosso plano cobre exclusivamente a mão de obra. As peças e materiais necessários para os reparos devem ser providenciados pelo cliente. Ocasionalmente, nossos profissionais podem levar materiais básicos (como parafusos, buchas, veda rosca), que serão cobrados à parte com total transparência.
                </AccordionContent>
              </AccordionItem>
              <div className="h-px bg-border mx-4"></div>
              <AccordionItem value="item-4" className="border-b-0">
                <AccordionTrigger className="text-left text-lg font-medium px-4">Como faço para agendar a visita?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground px-4 text-base leading-relaxed">
                  O agendamento é feito pelo formulário da página. Você informa email, telefone e endereço, nossa equipe valida a cobertura da sua região e retorna para combinar o melhor dia e horário para a visita.
                </AccordionContent>
              </AccordionItem>
              <div className="h-px bg-border mx-4"></div>
              <AccordionItem value="item-5" className="border-b-0">
                <AccordionTrigger className="text-left text-lg font-medium px-4">Como funciona a política de cancelamento?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground px-4 text-base leading-relaxed">
                  Não temos taxa de fidelidade nem multa rescisória. Você pode cancelar sua assinatura mensal a qualquer momento, sem burocracia, apenas nos avisando com antecedência de 15 dias para o próximo ciclo de faturamento.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section id="contato" className="py-20 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary z-0"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 z-0"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 z-0"></div>
          
          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-[1fr_520px] lg:items-center">
              <div className="text-center lg:text-left">
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-primary-foreground/70">
                  Próximo passo simples
                </p>
                <h2 className="mb-6 text-3xl font-bold text-primary-foreground md:text-5xl max-w-3xl">
                  Agende sua visita sem sair da página.
                </h2>
                <p className="mb-8 max-w-2xl text-lg text-primary-foreground/80 md:text-xl">
                  Envie os dados do seu imóvel pelo formulário, e nossa equipe retorna para confirmar cobertura, disponibilidade e o melhor horário.
                </p>
                <div className="flex flex-col items-center gap-4 sm:flex-row lg:items-start">
                  <ContactFormButton size="lg" variant="secondary" className="text-base px-8 h-14 rounded-full shadow-xl hover:scale-105 transition-transform">
                    Preencher formulário
                  </ContactFormButton>
                  <Button asChild size="lg" variant="outline" className="h-14 rounded-full border-white/25 bg-transparent px-8 text-base text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">
                    <a href="#faq">Ver dúvidas comuns</a>
                  </Button>
                </div>
              </div>

              <LeadCaptureForm />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-foreground font-bold text-xl">
            <Home className="h-6 w-6 text-primary" />
            <span>Casa em Dia</span>
          </div>
          <div className="text-sm text-muted-foreground text-center md:text-left">
            <p>Atendendo Osasco e região com dedicação e profissionalismo.</p>
            <p className="mt-1">&copy; {new Date().getFullYear()} Casa em Dia. Todos os direitos reservados.</p>
          </div>
          <div className="flex gap-4">
            <a href="#contato" className="text-sm font-medium text-primary hover:underline transition-colors">
              Agendar visita
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}