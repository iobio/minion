---
layout: post
title: Latest Gene.iobio features
image: /public/images/blog/feature_image_allele_counts.png
subtitle: Multi-sample vcf, https support, and allele counts
tags:
  - Tony DiSera

---

The week, we have pushed out some new features in gene.iobio.  

### Multi-sample VCF files

We now support multi-sample VCF files.  After entering the VCF URL or selecting the VCF file, a dropdown will appear if the file contains multiple samples. 

Here we show a VCF file containing 100+ samples.  The sample list can be narrowed down using the type-ahead feature.


<div style="text-align:center">
	<img src="/public/images/blog/multisample_vcf.png" style="width:40%"/>
</div>

Here is a screen capture showing a trio loaded from one file.  Even though the file might be quite large, gene.iobio only examines the samples of interest.

<div style="text-align:center">
	<img src="/public/images/blog/multisample_vcf_trio.png" style="width:100%"/>
</div>


### Secure File Serving

Gene.iobio can now handle files served using the https protocol, ensuring secure communication over the network -- a requirement when analyzing sensitive data.


### Allele Counts

Hover over a variant and the tooltip will include a bar for allele counts.  In this example, you can see the allele counts for a trio.  Notice how the parents are heterogous alternates and the proband is homozygous alternate.  The allele counts verify that there is adequate sequence coverage to make these calls.

<div style="text-align:center">
	<img src="/public/images/blog/allele_counts.png" style="width:50%"/>
</div>

Stay tuned.  More features are coming soon to gene.iobio including multi-gene navigation and extended trio functionality to analyze variants from unaffected siblings.

