import React from 'react';
import { DynamicButton } from '@/modules/shared/components/DynamicButton';
import { ArrowRight, Boxes, Palette, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Index = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const features = [
    {
      icon: <Boxes className="h-8 w-8" />,
      title: t('home.features.modular.title'),
      description: t('home.features.modular.description'),
    },
    {
      icon: <Palette className="h-8 w-8" />,
      title: t('home.features.configurable.title'),
      description: t('home.features.configurable.description'),
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: t('home.features.production.title'),
      description: t('home.features.production.description'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center space-y-8 mb-24">
          <div className="inline-block animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Zap className="h-4 w-4" />
              {t('home.hero.badge')}
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-heading font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            {t('home.hero.title').split(',')[0]},
            <br />
            {t('home.hero.title').split(',')[1]}
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            {t('home.hero.description')}
          </p>

          <div className="flex gap-4 justify-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            <DynamicButton
              variant="primary"
              size="lg"
              icon={<ArrowRight className="h-5 w-5" />}
              iconPosition="right"
              onClick={() => navigate('/demo')}
            >
              {t('home.hero.viewDemo')}
            </DynamicButton>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-24">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-card border rounded-xl p-8 hover:shadow-custom-lg transition-slow hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-8 duration-1000"
              style={{ animationDelay: `${600 + idx * 100}ms` }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10 text-primary mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-heading font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Component Types Section */}
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-heading font-bold">
            {t('home.components.title')}
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              t('home.components.types.inputs'),
              t('home.components.types.dropdowns'),
              t('home.components.types.grids'),
              t('home.components.types.uploaders'),
              t('home.components.types.forms'),
              t('home.components.types.buttons'),
              t('home.components.types.images'),
              t('home.components.types.submenus'),
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-muted/50 rounded-lg px-4 py-3 text-sm font-medium hover:bg-muted transition-base"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="pt-8">
            <DynamicButton
              variant="secondary"
              size="lg"
              onClick={() => navigate('/demo')}
            >
              {t('home.hero.exploreAll')}
            </DynamicButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
