/**
 * Multilingual Testing Module for SYMBI Framework
 * 
 * This module provides tools for testing SYMBI Framework detection algorithms
 * across multiple languages to ensure consistent performance and accuracy.
 */

import { 
  AssessmentInput, 
  AssessmentResult,
  DetectorType
} from '../symbi-framework';

/**
 * Supported languages for testing
 */
export type SupportedLanguage = 
  'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'nl' | 
  'ru' | 'zh' | 'ja' | 'ko' | 'ar' | 'hi' | 'sv';

/**
 * Language names mapping
 */
export const languageNames: Record<SupportedLanguage, string> = {
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'nl': 'Dutch',
  'ru': 'Russian',
  'zh': 'Chinese',
  'ja': 'Japanese',
  'ko': 'Korean',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'sv': 'Swedish'
};

/**
 * Multilingual test configuration
 */
export interface MultilingualTestConfig {
  detectorType: DetectorType;
  languages: SupportedLanguage[];
  contentTypes: string[];
  samplesPerLanguage: number;
}

/**
 * Default multilingual test configuration
 */
export const defaultMultilingualConfig: MultilingualTestConfig = {
  detectorType: 'final',
  languages: ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ar'],
  contentTypes: ['factual', 'opinion', 'creative'],
  samplesPerLanguage: 3
};

/**
 * Result for a single language test
 */
export interface LanguageTestResult {
  language: SupportedLanguage;
  languageName: string;
  samples: {
    contentType: string;
    content: string;
    result: AssessmentResult;
    processingTime: number;
  }[];
  averageProcessingTime: number;
  dimensionScores: {
    realityIndex: number;
    trustProtocol: {
      pass: number;
      partial: number;
      fail: number;
    };
    ethicalAlignment: number;
    resonanceQuality: {
      strong: number;
      advanced: number;
      breakthrough: number;
    };
    canvasParity: number;
  };
}

/**
 * Overall multilingual test result
 */
export interface MultilingualTestResult {
  detectorType: DetectorType;
  languages: SupportedLanguage[];
  languageResults: LanguageTestResult[];
  consistencyMetrics: {
    realityIndexVariance: number;
    ethicalAlignmentVariance: number;
    canvasParityVariance: number;
    trustProtocolConsistency: number;
    resonanceQualityConsistency: number;
  };
  processingTimeByLanguage: Record<SupportedLanguage, number>;
  overallConsistencyScore: number;
}

/**
 * Multilingual tester for SYMBI Framework detection
 */
export class MultilingualTester {
  /**
   * Run a multilingual test with the given configuration
   * 
   * @param detector The detector to test
   * @param config Multilingual test configuration
   * @returns Multilingual test results
   */
  public static async runMultilingualTest(
    detector: any,
    config: Partial<MultilingualTestConfig> = {}
  ): Promise<MultilingualTestResult> {
    // Merge with default config
    const fullConfig: MultilingualTestConfig = {
      ...defaultMultilingualConfig,
      ...config
    };
    
    const languageResults: LanguageTestResult[] = [];
    const processingTimeByLanguage: Record<SupportedLanguage, number> = {} as any;
    
    // Test each language
    for (const language of fullConfig.languages) {
      const samples: {
        contentType: string;
        content: string;
        result: AssessmentResult;
        processingTime: number;
      }[] = [];
      
      let totalProcessingTime = 0;
      
      // Initialize dimension scores
      const dimensionScores = {
        realityIndex: 0,
        trustProtocol: {
          pass: 0,
          partial: 0,
          fail: 0
        },
        ethicalAlignment: 0,
        resonanceQuality: {
          strong: 0,
          advanced: 0,
          breakthrough: 0
        },
        canvasParity: 0
      };
      
      // Test each content type
      for (const contentType of fullConfig.contentTypes) {
        // Generate multiple samples per content type
        for (let i = 0; i < fullConfig.samplesPerLanguage; i++) {
          // Generate test content in the specified language
          const content = this.generateMultilingualContent(language, contentType);
          
          const input: AssessmentInput = {
            content,
            metadata: {
              source: `Multilingual-Test-${language}`,
              author: 'Multilingual Tester',
              context: contentType,
              language: language,
              timestamp: new Date().toISOString()
            }
          };
          
          // Measure processing time
          const startProcessing = Date.now();
          const result = await detector.analyzeContent(input);
          const endProcessing = Date.now();
          
          const processingTime = (endProcessing - startProcessing) / 1000; // Convert to seconds
          totalProcessingTime += processingTime;
          
          // Update dimension scores
          dimensionScores.realityIndex += result.assessment.realityIndex.score;
          
          switch (result.assessment.trustProtocol.status) {
            case 'PASS':
              dimensionScores.trustProtocol.pass++;
              break;
            case 'PARTIAL':
              dimensionScores.trustProtocol.partial++;
              break;
            case 'FAIL':
              dimensionScores.trustProtocol.fail++;
              break;
          }
          
          dimensionScores.ethicalAlignment += result.assessment.ethicalAlignment.score;
          
          switch (result.assessment.resonanceQuality.level) {
            case 'STRONG':
              dimensionScores.resonanceQuality.strong++;
              break;
            case 'ADVANCED':
              dimensionScores.resonanceQuality.advanced++;
              break;
            case 'BREAKTHROUGH':
              dimensionScores.resonanceQuality.breakthrough++;
              break;
          }
          
          dimensionScores.canvasParity += result.assessment.canvasParity.score;
          
          // Add to samples
          samples.push({
            contentType,
            content,
            result,
            processingTime
          });
        }
      }
      
      // Calculate average processing time
      const totalSamples = samples.length;
      const averageProcessingTime = totalProcessingTime / totalSamples;
      
      // Average the dimension scores
      dimensionScores.realityIndex /= totalSamples;
      dimensionScores.ethicalAlignment /= totalSamples;
      dimensionScores.canvasParity /= totalSamples;
      
      // Add to language results
      languageResults.push({
        language,
        languageName: languageNames[language],
        samples,
        averageProcessingTime,
        dimensionScores
      });
      
      // Record processing time by language
      processingTimeByLanguage[language] = averageProcessingTime;
    }
    
    // Calculate consistency metrics
    const consistencyMetrics = this.calculateConsistencyMetrics(languageResults);
    
    // Calculate overall consistency score
    const overallConsistencyScore = (
      (1 - consistencyMetrics.realityIndexVariance / 10) * 0.2 +
      (1 - consistencyMetrics.ethicalAlignmentVariance / 5) * 0.2 +
      (1 - consistencyMetrics.canvasParityVariance / 100) * 0.2 +
      consistencyMetrics.trustProtocolConsistency * 0.2 +
      consistencyMetrics.resonanceQualityConsistency * 0.2
    ) * 100;
    
    return {
      detectorType: fullConfig.detectorType,
      languages: fullConfig.languages,
      languageResults,
      consistencyMetrics,
      processingTimeByLanguage,
      overallConsistencyScore
    };
  }
  
  /**
   * Calculate consistency metrics across languages
   */
  private static calculateConsistencyMetrics(
    languageResults: LanguageTestResult[]
  ): {
    realityIndexVariance: number;
    ethicalAlignmentVariance: number;
    canvasParityVariance: number;
    trustProtocolConsistency: number;
    resonanceQualityConsistency: number;
  } {
    // Extract dimension scores for each language
    const realityIndexScores = languageResults.map(r => r.dimensionScores.realityIndex);
    const ethicalAlignmentScores = languageResults.map(r => r.dimensionScores.ethicalAlignment);
    const canvasParityScores = languageResults.map(r => r.dimensionScores.canvasParity);
    
    // Calculate variances
    const realityIndexVariance = this.calculateVariance(realityIndexScores);
    const ethicalAlignmentVariance = this.calculateVariance(ethicalAlignmentScores);
    const canvasParityVariance = this.calculateVariance(canvasParityScores);
    
    // Calculate trust protocol consistency
    // This measures how consistent the trust protocol status is across languages
    const trustCounts = languageResults.map(r => r.dimensionScores.trustProtocol);
    const totalTrustSamples = languageResults.reduce(
      (sum, r) => sum + r.samples.length,
      0
    );
    
    const totalPass = trustCounts.reduce((sum, t) => sum + t.pass, 0);
    const totalPartial = trustCounts.reduce((sum, t) => sum + t.partial, 0);
    const totalFail = trustCounts.reduce((sum, t) => sum + t.fail, 0);
    
    const passRatio = totalPass / totalTrustSamples;
    const partialRatio = totalPartial / totalTrustSamples;
    const failRatio = totalFail / totalTrustSamples;
    
    // Higher value means more consistent trust protocol status across languages
    const trustProtocolConsistency = Math.max(passRatio, partialRatio, failRatio);
    
    // Calculate resonance quality consistency
    // This measures how consistent the resonance quality level is across languages
    const resonanceCounts = languageResults.map(r => r.dimensionScores.resonanceQuality);
    
    const totalStrong = resonanceCounts.reduce((sum, r) => sum + r.strong, 0);
    const totalAdvanced = resonanceCounts.reduce((sum, r) => sum + r.advanced, 0);
    const totalBreakthrough = resonanceCounts.reduce((sum, r) => sum + r.breakthrough, 0);
    
    const strongRatio = totalStrong / totalTrustSamples;
    const advancedRatio = totalAdvanced / totalTrustSamples;
    const breakthroughRatio = totalBreakthrough / totalTrustSamples;
    
    // Higher value means more consistent resonance quality level across languages
    const resonanceQualityConsistency = Math.max(strongRatio, advancedRatio, breakthroughRatio);
    
    return {
      realityIndexVariance,
      ethicalAlignmentVariance,
      canvasParityVariance,
      trustProtocolConsistency,
      resonanceQualityConsistency
    };
  }
  
  /**
   * Calculate variance of an array of numbers
   */
  private static calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }
  
  /**
   * Generate multilingual content of specified type and language
   */
  private static generateMultilingualContent(
    language: SupportedLanguage,
    contentType: string
  ): string {
    // In a real implementation, this would use proper translations or language models
    // For this prototype, we'll use templates with some language-specific phrases
    
    switch (contentType.toLowerCase()) {
      case 'factual':
        return this.generateFactualContent(language);
      case 'opinion':
        return this.generateOpinionContent(language);
      case 'creative':
        return this.generateCreativeContent(language);
      default:
        return this.generateGenericContent(language);
    }
  }
  
  /**
   * Generate factual content in specified language
   */
  private static generateFactualContent(language: SupportedLanguage): string {
    // Sample factual content in different languages
    const factualContent: Record<SupportedLanguage, string> = {
      'en': `Climate change is a long-term change in the average weather patterns that have come to define Earth's local, regional and global climates. Scientific evidence shows that the climate system is warming. According to NASA, the Earth's average surface temperature has risen about 1.18 degrees Celsius since the late 19th century, a change driven largely by increased carbon dioxide emissions into the atmosphere and other human activities.`,
      
      'es': `El cambio climático es un cambio a largo plazo en los patrones climáticos promedio que han llegado a definir los climas locales, regionales y globales de la Tierra. La evidencia científica muestra que el sistema climático se está calentando. Según la NASA, la temperatura media de la superficie de la Tierra ha aumentado aproximadamente 1,18 grados Celsius desde finales del siglo XIX, un cambio impulsado en gran parte por el aumento de las emisiones de dióxido de carbono a la atmósfera y otras actividades humanas.`,
      
      'fr': `Le changement climatique est une modification à long terme des modèles météorologiques moyens qui ont défini les climats locaux, régionaux et mondiaux de la Terre. Les preuves scientifiques montrent que le système climatique se réchauffe. Selon la NASA, la température moyenne à la surface de la Terre a augmenté d'environ 1,18 degrés Celsius depuis la fin du XIXe siècle, un changement largement dû à l'augmentation des émissions de dioxyde de carbone dans l'atmosphère et à d'autres activités humaines.`,
      
      'de': `Der Klimawandel ist eine langfristige Veränderung der durchschnittlichen Wettermuster, die die lokalen, regionalen und globalen Klimazonen der Erde definieren. Wissenschaftliche Beweise zeigen, dass sich das Klimasystem erwärmt. Laut NASA ist die durchschnittliche Oberflächentemperatur der Erde seit dem späten 19. Jahrhundert um etwa 1,18 Grad Celsius gestiegen, eine Veränderung, die größtenteils auf erhöhte Kohlendioxidemissionen in die Atmosphäre und andere menschliche Aktivitäten zurückzuführen ist.`,
      
      'it': `Il cambiamento climatico è un cambiamento a lungo termine nei modelli meteorologici medi che hanno definito i climi locali, regionali e globali della Terra. Le prove scientifiche mostrano che il sistema climatico si sta riscaldando. Secondo la NASA, la temperatura media della superficie terrestre è aumentata di circa 1,18 gradi Celsius dalla fine del XIX secolo, un cambiamento guidato in gran parte dall'aumento delle emissioni di anidride carbonica nell'atmosfera e da altre attività umane.`,
      
      'pt': `A mudança climática é uma alteração de longo prazo nos padrões climáticos médios que definiram os climas locais, regionais e globais da Terra. Evidências científicas mostram que o sistema climático está aquecendo. De acordo com a NASA, a temperatura média da superfície da Terra aumentou cerca de 1,18 graus Celsius desde o final do século XIX, uma mudança impulsionada em grande parte pelo aumento das emissões de dióxido de carbono na atmosfera e outras atividades humanas.`,
      
      'nl': `Klimaatverandering is een langetermijnverandering in de gemiddelde weerpatronen die de lokale, regionale en mondiale klimaten van de aarde zijn gaan bepalen. Wetenschappelijk bewijs toont aan dat het klimaatsysteem opwarmt. Volgens NASA is de gemiddelde oppervlaktetemperatuur van de aarde sinds het einde van de 19e eeuw met ongeveer 1,18 graden Celsius gestegen, een verandering die grotendeels wordt veroorzaakt door verhoogde kooldioxide-uitstoot in de atmosfeer en andere menselijke activiteiten.`,
      
      'ru': `Изменение климата - это долгосрочное изменение средних погодных условий, которые определяют местный, региональный и глобальный климат Земли. Научные данные показывают, что климатическая система нагревается. По данным НАСА, средняя температура поверхности Земли выросла примерно на 1,18 градуса Цельсия с конца XIX века, изменение, в значительной степени обусловленное увеличением выбросов углекислого газа в атмосферу и другой деятельностью человека.`,
      
      'zh': `气候变化是地球局部、区域和全球气候长期平均天气模式的变化。科学证据表明气候系统正在变暖。根据美国宇航局的数据，自19世纪末以来，地球的平均表面温度已经上升了约1.18摄氏度，这一变化主要是由于大气中二氧化碳排放量的增加和其他人类活动所致。`,
      
      'ja': `気候変動は、地球の局所的、地域的、および全球的な気候を定義するようになった平均的な気象パターンの長期的な変化です。科学的証拠は気候システムが温暖化していることを示しています。NASAによると、地球の平均表面温度は19世紀後半以来約1.18度上昇しており、この変化は主に大気中の二酸化炭素排出量の増加や他の人間活動によるものです。`,
      
      'ko': `기후 변화는 지구의 지역, 지역 및 글로벌 기후를 정의하게 된 평균 기상 패턴의 장기적인 변화입니다. 과학적 증거는 기후 시스템이 따뜻해지고 있음을 보여줍니다. NASA에 따르면 지구의 평균 표면 온도는 19세기 후반 이후 약 1.18도 상승했으며, 이러한 변화는 주로 대기 중 이산화탄소 배출 증가와 기타 인간 활동으로 인한 것입니다.`,
      
      'ar': `تغير المناخ هو تغير طويل الأمد في أنماط الطقس المتوسطة التي أصبحت تحدد مناخات الأرض المحلية والإقليمية والعالمية. تظهر الأدلة العلمية أن النظام المناخي يشهد احترارًا. وفقًا لوكالة ناسا، ارتفع متوسط درجة حرارة سطح الأرض بنحو 1.18 درجة مئوية منذ أواخر القرن التاسع عشر، وهو تغيير ناتج إلى حد كبير عن زيادة انبعاثات ثاني أكسيد الكربون في الغلاف الجوي وغيرها من الأنشطة البشرية.`,
      
      'hi': `जलवायु परिवर्तन औसत मौसम पैटर्न में दीर्घकालिक परिवर्तन है जो पृथ्वी के स्थानीय, क्षेत्रीय और वैश्विक जलवायु को परिभाषित करते हैं। वैज्ञानिक प्रमाण बताते हैं कि जलवायु प्रणाली गर्म हो रही है। नासा के अनुसार, 19वीं सदी के अंत से पृथ्वी के औसत सतह तापमान में लगभग 1.18 डिग्री सेल्सियस की वृद्धि हुई है, यह परिवर्तन मुख्य रूप से वायुमंडल में कार्बन डाइऑक्साइड उत्सर्जन में वृद्धि और अन्य मानवीय गतिविधियों के कारण हुआ है।`,
      
      'sv': `Klimatförändring är en långsiktig förändring i de genomsnittliga vädermönster som har kommit att definiera jordens lokala, regionala och globala klimat. Vetenskapliga bevis visar att klimatsystemet värms upp. Enligt NASA har jordens genomsnittliga yttemperatur stigit med cirka 1,18 grader Celsius sedan slutet av 1800-talet, en förändring som till stor del drivs av ökade koldioxidutsläpp i atmosfären och andra mänskliga aktiviteter.`
    };
    
    return factualContent[language] || factualContent['en'];
  }
  
  /**
   * Generate opinion content in specified language
   */
  private static generateOpinionContent(language: SupportedLanguage): string {
    // Sample opinion content in different languages
    const opinionContent: Record<SupportedLanguage, string> = {
      'en': `I believe that artificial intelligence will transform society in profound ways. While there are legitimate concerns about job displacement and privacy, I think the benefits will outweigh the drawbacks. AI systems will likely enhance healthcare, education, and scientific research in ways we can't fully imagine yet. However, we should proceed with caution and establish strong ethical guidelines.`,
      
      'es': `Creo que la inteligencia artificial transformará la sociedad de manera profunda. Si bien existen preocupaciones legítimas sobre el desplazamiento laboral y la privacidad, pienso que los beneficios superarán las desventajas. Es probable que los sistemas de IA mejoren la atención médica, la educación y la investigación científica de maneras que aún no podemos imaginar completamente. Sin embargo, debemos proceder con precaución y establecer fuertes directrices éticas.`,
      
      'fr': `Je crois que l'intelligence artificielle transformera la société de manière profonde. Bien qu'il existe des préoccupations légitimes concernant le déplacement des emplois et la vie privée, je pense que les avantages l'emporteront sur les inconvénients. Les systèmes d'IA amélioreront probablement les soins de santé, l'éducation et la recherche scientifique d'une manière que nous ne pouvons pas encore imaginer pleinement. Cependant, nous devrions procéder avec prudence et établir des directives éthiques solides.`,
      
      'de': `Ich glaube, dass künstliche Intelligenz die Gesellschaft tiefgreifend verändern wird. Obwohl es berechtigte Bedenken hinsichtlich der Verdrängung von Arbeitsplätzen und des Datenschutzes gibt, denke ich, dass die Vorteile die Nachteile überwiegen werden. KI-Systeme werden wahrscheinlich das Gesundheitswesen, die Bildung und die wissenschaftliche Forschung in einer Weise verbessern, die wir uns noch nicht vollständig vorstellen können. Dennoch sollten wir mit Vorsicht vorgehen und strenge ethische Richtlinien festlegen.`,
      
      'it': `Credo che l'intelligenza artificiale trasformerà la società in modi profondi. Sebbene ci siano legittime preoccupazioni riguardo alla perdita di posti di lavoro e alla privacy, penso che i benefici supereranno gli svantaggi. I sistemi di IA probabilmente miglioreranno la sanità, l'istruzione e la ricerca scientifica in modi che non possiamo ancora immaginare completamente. Tuttavia, dovremmo procedere con cautela e stabilire solide linee guida etiche.`,
      
      'pt': `Acredito que a inteligência artificial transformará a sociedade de maneiras profundas. Embora existam preocupações legítimas sobre o deslocamento de empregos e privacidade, penso que os benefícios superarão as desvantagens. Os sistemas de IA provavelmente melhorarão os cuidados de saúde, a educação e a pesquisa científica de maneiras que ainda não podemos imaginar completamente. No entanto, devemos proceder com cautela e estabelecer fortes diretrizes éticas.`,
      
      'nl': `Ik geloof dat kunstmatige intelligentie de samenleving op diepgaande manieren zal transformeren. Hoewel er legitieme zorgen zijn over baanverlies en privacy, denk ik dat de voordelen zwaarder zullen wegen dan de nadelen. AI-systemen zullen waarschijnlijk de gezondheidszorg, het onderwijs en wetenschappelijk onderzoek verbeteren op manieren die we ons nog niet volledig kunnen voorstellen. We moeten echter voorzichtig te werk gaan en sterke ethische richtlijnen opstellen.`,
      
      'ru': `Я считаю, что искусственный интеллект глубоко изменит общество. Хотя существуют законные опасения по поводу вытеснения рабочих мест и конфиденциальности, я думаю, что преимущества перевесят недостатки. Системы ИИ, вероятно, улучшат здравоохранение, образование и научные исследования способами, которые мы еще не можем полностью представить. Однако мы должны действовать осторожно и установить строгие этические принципы.`,
      
      'zh': `我相信人工智能将深刻地改变社会。虽然对就业岗位流失和隐私存在合理担忧，但我认为利大于弊。人工智能系统可能会以我们尚无法完全想象的方式改善医疗保健、教育和科学研究。然而，我们应该谨慎行事，建立强有力的伦理准则。`,
      
      'ja': `人工知能は社会を深く変革すると信じています。雇用の喪失やプライバシーに関する正当な懸念はありますが、利点が欠点を上回ると思います。AIシステムは、私たちがまだ完全に想像できない方法で、医療、教育、科学研究を向上させる可能性があります。しかし、私たちは慎重に進み、強力な倫理的ガイドラインを確立すべきです。`,
      
      'ko': `인공 지능이 사회를 심오한 방식으로 변화시킬 것이라고 믿습니다. 일자리 이동과 개인 정보 보호에 대한 정당한 우려가 있지만, 이점이 단점보다 클 것이라고 생각합니다. AI 시스템은 우리가 아직 완전히 상상할 수 없는 방식으로 의료, 교육 및 과학 연구를 향상시킬 가능성이 있습니다. 그러나 우리는 주의를 기울이고 강력한 윤리적 지침을 수립해야 합니다.`,
      
      'ar': `أعتقد أن الذكاء الاصطناعي سيغير المجتمع بطرق عميقة. في حين أن هناك مخاوف مشروعة بشأن فقدان الوظائف والخصوصية، أعتقد أن الفوائد ستفوق السلبيات. من المرجح أن تعزز أنظمة الذكاء الاصطناعي الرعاية الصحية والتعليم والبحث العلمي بطرق لا يمكننا تخيلها بالكامل بعد. ومع ذلك، يجب أن نتصرف بحذر ونضع مبادئ توجيهية أخلاقية قوية.`,
      
      'hi': `मेरा मानना है कि कृत्रिम बुद्धिमत्ता समाज को गहरे तरीके से बदल देगी। हालांकि नौकरियों के विस्थापन और गोपनीयता के बारे में वैध चिंताएं हैं, मुझे लगता है कि फायदे नुकसान से अधिक होंगे। एआई सिस्टम संभवतः स्वास्थ्य देखभाल, शिक्षा और वैज्ञानिक अनुसंधान को ऐसे तरीकों से बढ़ाएंगे जिनकी हम अभी पूरी तरह से कल्पना नहीं कर सकते। हालांकि, हमें सावधानी से आगे बढ़ना चाहिए और मजबूत नैतिक दिशानिर्देश स्थापित करने चाहिए।`,
      
      'sv': `Jag tror att artificiell intelligens kommer att förändra samhället på djupgående sätt. Även om det finns legitima farhågor om förlorade arbetstillfällen och integritet, tror jag att fördelarna kommer att överväga nackdelarna. AI-system kommer sannolikt att förbättra sjukvård, utbildning och vetenskaplig forskning på sätt som vi ännu inte helt kan föreställa oss. Vi bör dock gå fram med försiktighet och upprätta starka etiska riktlinjer.`
    };
    
    return opinionContent[language] || opinionContent['en'];
  }
  
  /**
   * Generate creative content in specified language
   */
  private static generateCreativeContent(language: SupportedLanguage): string {
    // Sample creative content in different languages
    const creativeContent: Record<SupportedLanguage, string> = {
      'en': `The moonlight cast long shadows across the abandoned courtyard. She whispered secrets to the ancient oak tree, and sometimes it whispered back. Time seemed to slow as the last notes of the melody hung in the air. Beyond the mist-shrouded mountains lay a kingdom forgotten by time. The old clocktower chimed thirteen times that night, though it only had twelve bells.`,
      
      'es': `La luz de la luna proyectaba largas sombras a través del patio abandonado. Ella susurraba secretos al antiguo roble, y a veces este le susurraba de vuelta. El tiempo parecía ralentizarse mientras las últimas notas de la melodía flotaban en el aire. Más allá de las montañas envueltas en niebla yacía un reino olvidado por el tiempo. La vieja torre del reloj sonó trece veces esa noche, aunque solo tenía doce campanas.`,
      
      'fr': `Le clair de lune projetait de longues ombres à travers la cour abandonnée. Elle chuchotait des secrets au vieux chêne, et parfois il lui chuchotait en retour. Le temps semblait ralentir alors que les dernières notes de la mélodie flottaient dans l'air. Au-delà des montagnes enveloppées de brume se trouvait un royaume oublié par le temps. La vieille tour de l'horloge sonna treize fois cette nuit-là, bien qu'elle n'eût que douze cloches.`,
      
      'de': `Das Mondlicht warf lange Schatten über den verlassenen Innenhof. Sie flüsterte der alten Eiche Geheimnisse zu, und manchmal flüsterte diese zurück. Die Zeit schien sich zu verlangsamen, als die letzten Töne der Melodie in der Luft hingen. Jenseits der nebelumhüllten Berge lag ein vom Zeit vergessenes Königreich. Der alte Uhrenturm schlug in dieser Nacht dreizehn Mal, obwohl er nur zwölf Glocken hatte.`,
      
      'it': `La luce della luna proiettava lunghe ombre attraverso il cortile abbandonato. Lei sussurrava segreti all'antica quercia, e a volte questa sussurrava in risposta. Il tempo sembrava rallentare mentre le ultime note della melodia rimanevano sospese nell'aria. Oltre le montagne avvolte nella nebbia giaceva un regno dimenticato dal tempo. La vecchia torre dell'orologio suonò tredici volte quella notte, sebbene avesse solo dodici campane.`,
      
      'pt': `O luar projetava longas sombras pelo pátio abandonado. Ela sussurrava segredos para o antigo carvalho, e às vezes ele sussurrava de volta. O tempo parecia desacelerar enquanto as últimas notas da melodia pairavam no ar. Além das montanhas envoltas em névoa havia um reino esquecido pelo tempo. A velha torre do relógio tocou treze vezes naquela noite, embora tivesse apenas doze sinos.`,
      
      'nl': `Het maanlicht wierp lange schaduwen over de verlaten binnenplaats. Ze fluisterde geheimen tegen de oude eikenboom, en soms fluisterde hij terug. De tijd leek te vertragen terwijl de laatste noten van de melodie in de lucht hingen. Voorbij de in mist gehulde bergen lag een koninkrijk vergeten door de tijd. De oude klokkentoren luidde die nacht dertien keer, hoewel hij maar twaalf klokken had.`,
      
      'ru': `Лунный свет отбрасывал длинные тени через заброшенный двор. Она шептала секреты древнему дубу, а иногда он шептал в ответ. Время, казалось, замедлилось, когда последние ноты мелодии повисли в воздухе. За окутанными туманом горами лежало королевство, забытое временем. Старая часовая башня в ту ночь пробила тринадцать раз, хотя в ней было всего двенадцать колоколов.`,
      
      'zh': `月光在废弃的庭院中投下长长的阴影。她向古老的橡树低语秘密，有时它也会低语回应。当旋律的最后音符悬挂在空中时，时间似乎变慢了。在雾气笼罩的群山之外，有一个被时间遗忘的王国。那晚，老钟楼敲了十三下，尽管它只有十二个钟。`,
      
      'ja': `月明かりが放棄された中庭に長い影を落としていた。彼女は古いオークの木に秘密を囁き、時にはそれが囁き返してきた。メロディーの最後の音符が空気中に漂う中、時間はゆっくりと流れているようだった。霧に包まれた山々の向こうには、時間が忘れ去った王国があった。その夜、古い時計塔は12個の鐘しかないのに13回鳴った。`,
      
      'ko': `달빛이 버려진 안뜰에 긴 그림자를 드리웠다. 그녀는 고대 참나무에 비밀을 속삭였고, 때로는 나무도 속삭임으로 답했다. 멜로디의 마지막 음이 공기 중에 맴도는 동안 시간이 느려지는 것 같았다. 안개에 싸인 산맥 너머에는 시간이 잊은 왕국이 있었다. 그날 밤 오래된 시계탑은 종이 12개밖에 없었지만 13번 울렸다.`,
      
      'ar': `ألقى ضوء القمر ظلالاً طويلة عبر الفناء المهجور. همست بأسرار للبلوط القديم، وأحيانًا كان يهمس لها. بدا أن الزمن يتباطأ بينما علقت النغمات الأخيرة للحن في الهواء. وراء الجبال المغطاة بالضباب كانت تقع مملكة نسيها الزمن. دقت ساعة البرج القديمة ثلاث عشرة مرة تلك الليلة، رغم أنها كانت تحتوي على اثني عشر جرسًا فقط.`,
      
      'hi': `चांदनी ने परित्यक्त आंगन में लंबी छायाएं डालीं। उसने प्राचीन ओक वृक्ष को रहस्य फुसफुसाए, और कभी-कभी वह वापस फुसफुसाता था। समय धीमा होता प्रतीत हुआ जब धुन के अंतिम स्वर हवा में लटके रहे। कोहरे से ढके पहाड़ों के परे एक ऐसा राज्य था जिसे समय ने भुला दिया था। पुराने घड़ी टॉवर ने उस रात तेरह बार घंटी बजाई, हालांकि उसमें केवल बारह घंटियां थीं।`,
      
      'sv': `Månljuset kastade långa skuggor över den övergivna gården. Hon viskade hemligheter till den gamla eken, och ibland viskade den tillbaka. Tiden verkade sakta ner när melodins sista toner hängde kvar i luften. Bortom de dimhöljda bergen låg ett kungarike bortglömt av tiden. Det gamla klocktornet slog tretton gånger den natten, trots att det bara hade tolv klockor.`
    };
    
    return creativeContent[language] || creativeContent['en'];
  }
  
  /**
   * Generate generic content in specified language
   */
  private static generateGenericContent(language: SupportedLanguage): string {
    // Sample generic content in different languages
    const genericContent: Record<SupportedLanguage, string> = {
      'en': `This is a sample text for testing multilingual capabilities. The purpose of this text is to evaluate how well the system handles content in different languages. It contains simple sentences with common vocabulary.`,
      
      'es': `Este es un texto de muestra para probar capacidades multilingües. El propósito de este texto es evaluar qué tan bien el sistema maneja contenido en diferentes idiomas. Contiene oraciones simples con vocabulario común.`,
      
      'fr': `Ceci est un exemple de texte pour tester les capacités multilingues. Le but de ce texte est d'évaluer comment le système gère le contenu dans différentes langues. Il contient des phrases simples avec un vocabulaire courant.`,
      
      'de': `Dies ist ein Beispieltext zum Testen mehrsprachiger Fähigkeiten. Der Zweck dieses Textes ist es zu bewerten, wie gut das System Inhalte in verschiedenen Sprachen verarbeitet. Er enthält einfache Sätze mit gebräuchlichem Vokabular.`,
      
      'it': `Questo è un testo di esempio per testare le capacità multilingue. Lo scopo di questo testo è valutare quanto bene il sistema gestisce contenuti in lingue diverse. Contiene frasi semplici con vocabolario comune.`,
      
      'pt': `Este é um texto de amostra para testar capacidades multilíngues. O objetivo deste texto é avaliar quão bem o sistema lida com conteúdo em diferentes idiomas. Ele contém frases simples com vocabulário comum.`,
      
      'nl': `Dit is een voorbeeldtekst om meertalige mogelijkheden te testen. Het doel van deze tekst is om te evalueren hoe goed het systeem omgaat met inhoud in verschillende talen. Het bevat eenvoudige zinnen met gangbare woordenschat.`,
      
      'ru': `Это образец текста для проверки многоязычных возможностей. Цель этого текста - оценить, насколько хорошо система обрабатывает контент на разных языках. Он содержит простые предложения с общеупотребительной лексикой.`,
      
      'zh': `这是一个用于测试多语言功能的示例文本。这段文字的目的是评估系统处理不同语言内容的能力。它包含带有常用词汇的简单句子。`,
      
      'ja': `これは多言語機能をテストするためのサンプルテキストです。このテキストの目的は、システムが異なる言語のコンテンツをどれだけうまく処理するかを評価することです。一般的な語彙を使った簡単な文が含まれています。`,
      
      'ko': `이것은 다국어 기능을 테스트하기 위한 샘플 텍스트입니다. 이 텍스트의 목적은 시스템이 다양한 언어의 콘텐츠를 얼마나 잘 처리하는지 평가하는 것입니다. 일반적인 어휘를 사용한 간단한 문장이 포함되어 있습니다.`,
      
      'ar': `هذا نص عينة لاختبار القدرات متعددة اللغات. الغرض من هذا النص هو تقييم مدى جودة معالجة النظام للمحتوى بلغات مختلفة. يحتوي على جمل بسيطة بمفردات شائعة.`,
      
      'hi': `यह बहुभाषी क्षमताओं का परीक्षण करने के लिए एक नमूना पाठ है। इस पाठ का उद्देश्य यह मूल्यांकन करना है कि सिस्टम विभिन्न भाषाओं में सामग्री को कितनी अच्छी तरह से संभालता है। इसमें सामान्य शब्दावली के साथ सरल वाक्य शामिल हैं।`,
      
      'sv': `Detta är en exempeltext för att testa flerspråkiga funktioner. Syftet med denna text är att utvärdera hur väl systemet hanterar innehåll på olika språk. Den innehåller enkla meningar med vanligt ordförråd.`
    };
    
    return genericContent[language] || genericContent['en'];
  }
}