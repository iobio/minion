---
layout: post
title: Gene.iobio integrates VEP
image: /public/images/blog/veplogo.png
subtitle: Polyphen & SIFT classifications, Regulatory annotations, and HGVS & dbSNP ids.
tags:
  - Tony DiSera

---


When we released gene.iobio a couple weeks ago, we had a few requests to add Ensembl's Variant Effect Predictor (VEP) tool. 

<div class="tweet-feed" style="padding-bottom:10px;">
	<blockquote class="twitter-tweet" lang="en"><p lang="en" dir="ltr">It will in a new release soon! <a href="https://twitter.com/jxchong">@jxchong</a> <a href="https://twitter.com/brent_p">@brent_p</a></p>&mdash; Gabor Marth (@MarthGabor) <a href="https://twitter.com/MarthGabor/status/629013788931584000">August 5, 2015</a></blockquote>
	<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
</div>


And as any good PI does, Gabor was quick to sign us up to do it! After taking his Twitter account away, we made good on the promise and officially added VEP support, which gives us (along with SnpEff) two powerful variant effect predictor tools.



### VEP Consequence


VEP determines the variant consequence on protein coding, a classification that is analogous to SnpEff's Effect. In fact, these classifications are highly concordant when evaluating coding variants, but keep in mind that these classifications do diverge in the categories of splicing, frameshift, and stop gain. [Andrew Jesaitis has written a terrific blog post](http://blog.goldenhelix.com/ajesaitis/the-sate-of-variant-annotation-a-comparison-of-annovar-snpeff-and-vep/) that explains these differences in his in depth comparison of SnpEff, VEP and Annovar.

We only color variants with either SnpEff or VEP classifications at any given time. You can easily alternate between SnpEff and VEP classifications in the filter panel using the Impact dropdown.  

<div style="text-align:center">
	<img src="/public/images/blog/vepblog2.png" style="width:20%"/>
</div>

However, both classifications are visible on the variant tooltip displays.


<div style="text-align:center">
	<img src="/public/images/blog/vepblog3.png" style="width:50%"/>
</div>

By default, variants are colored based on SnpEff Impact, a high level prioritization scheme on SnpEff Effect, summarizing the categories into four possible levels:  High, Moderate, Modifier and Low. 

<div style="text-align:center">
	<img src="/public/images/blog/vepblog4.png" style="width:15%;vertical-align:top"/>	
	<img src="/public/images/blog/vepblog5.png" style="width:80%"/>
</div>

To color based on SnpEff Effect, click on the Effect link.

<img src="/public/images/blog/vepblog6.png" style="width:15%;vertical-align:top"/>
<img src="/public/images/blog/vepblog7.png" style="width:80%"/>

Now the variants have switched from the SnpEff Impact color scheme (e.g. High, Moderate, Modifier, Low) to the SnpEff Effect color scheme (e.g. missense, frameshift, etc.).  The same color scheme switching can be performed on VEP impact and consequence.


### Predicting Impact on Protein Function 

Given that non-synonymous SNPs comprise over half of the mutations known to be involved in human inherited diseases, algorithm-based approaches to predicting disruption to protein structure and function are critical to understanding human disease and phenotype [(Wu, Yang 2012)](http://www.ncbi.nlm.nih.gov/pmc/articles/PMC3572689/pdf/TSWJ2013-675851.pdf). VEP reports classifications from two such algorithms -- [SIFT](http://sift.jcvi.org/) and [PolyPhen](http://genetics.bwh.harvard.edu/pph2/).  Both SIFT and PolyPhen analyze sequence homology, whereby substitutions at highly conserved regions are predicted to have higher impact on protein function.  In addition, PolyPhen utilizes sequence annotation to inventory features mapped to the location of the substitution.  PolyPhen also maps to the 3D protein structure to predict if the amino acid substitution will disrupt the hydrophobic core, alter electrostatic interactions, or interfere with ligand actions.  

Gene.iobio provides filters based on SIFT and PolyPhen classifications:

<div style="text-align:center">
	<img src="/public/images/blog/vepblog8.png" style="width:20%;vertical-align:top"/>
	<img src="/public/images/blog/vepblog9.png" style="width:25%;vertical-align:top"/>
</div>

In addition, PolyPhen and SIFT classifications are used to rank the variants.
  
<div style="text-align:center">
	<img src="/public/images/blog/vepblog10.png" style="width:50%"/>
</div>

In this example, the first variant in the ranked list has a PolyPhen classification of 'Probably Damaging' and a SIFT classification of 'Deleterious', providing additional insight into a moderate impact variant catalogued with conflicting interpretations in ClinVar.

When evaluating a variant's pathogenicity, it is important to consider the variation type and seek other evidence-based sources in addition to the SIFT and PolyPhen predictions.  In the paper by [Flanagan, et al 2010](http://www.researchgate.net/publication/45273588_Using_SIFT_and_PolyPhen_to_Predict_Loss-of-Function_and_Gain-of-Function_Mutations) which tested the predictive value of SIFT and PolyPhen, it was found that the sensitivity was reasonably high, but that the specificity was quite low, especially for gain-of-function mutations. When considering just SNPs or loss-of-function mutations, these tools performed much better.


### Regulatory Annotations

In addition to annotating protein coding variants, VEP also reports on variants that are located in predicted regulatory sites based on the [Ensembl Regulatory Build](http://www.ensembl.org/info/genome/funcgen/regulatory_build.html).  Gene.iobio now allows variant filtering on these regulatory classifications:

<div style="text-align:center">
	<img src="/public/images/blog/vepblog11.png" style="width:20%"/>
</div>

And the variant tooltip provides link outs to Ensembl, showing multiple tracks for different cell types.  For example, SNP located in a predicted TF binding site is only active in the Human Embryonic Stem Cell type.

<div style="text-align:center">
	<img src="/public/images/blog/vepblog12.png" style="width:30%;vertical-align:top"/>
	<img src="/public/images/blog/vepblog13.png" style="width:65%"/>
</div>

For TF motif features, the link out to Ensembl shows the sequence logo along with a frequency matrix from the JASPER core database [(Mathelier, et al 2013)](http://www.ncbi.nlm.nih.gov/pubmed?Db=pubmed&Cmd=ShowDetailView&TermToSearch=14681366&ordinalpos=3&itool=EntrezSystem2.PEntrez.Pubmed.Pubmed_ResultsPanel.Pubmed_RVDocSum).

<div style="text-align:center">
	<img src="/public/images/blog/vepblog14.png" style="width:30%;vertical-align:top"/>
	<img src="/public/images/blog/vepblog15.png" style="width:65%"/>
</div>


### Variant Identifiers and Nomenclature

VEP also provides the dbSNP identifier (i.e. rs number) as well as the HGVS notation for the variant. The HGVS notation is based on the GENCODE transcript set. Additionally, we plan to incorporate the RefSeq transcript set in the near future.  In gene.iobio, the tooltip for the variant will show both HGVS notation and the dbSNP id, with the latter linking out to the dbSNP webpage for the particular variant.

<div style="text-align:center">
	<img src="/public/images/blog/vepblog16.png" style="width:40%"/>
</div>


### Coming Soon

With VEP integration complete, stay tuned for enhancements to easily navigate through a set of genes, support for multi-sample vcfs, color exons based on sequence coverage, and much more.  (VEP is no longer planned!)




