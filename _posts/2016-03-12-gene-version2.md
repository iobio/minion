---
layout: post
title: Gene.iobio version 2.0
image: /public/images/blog/gene_version2/main.png
subtitle: Release of version 2.0 of gene.iobio with major new functionality
tags:
  - Alistair Ward
  - gene.iobio
---
We are thrilled to announce the release of <a href='http://gene.iobio.io'>gene.iobio</a> version 2.0! This new release features a major facelift and lots of new functionality that significantly enhances the power and usability of <a href='http://gene.iobio.io'>gene.iobio</a>. The single most important enhancement is that we have now moved from being a single gene to a multi-gene assessment tool, with integrated methods of generating and importing gene lists, including manual import and phenotype driven list generation with <a href='http://phenolyzer.usc.edu'>Phenolyzer</a>. Below, we can see where genes being investigated can be selected and the transcript set can be switched between Gencode and RefSeq.

<div><img src="/public/images/blog/gene_version2/badges.png" style="width:100%; margin: 20px 0"></img></div>

This post is the first in a series describing the new interface and features and will focus on changes to the interface. The series will then continue to address in more detail, the following topics:

<ol type="1">
  <li>Displaying variants based on the VCF filter status,</li>
  <li>Using RefSeq and GenCode gene transcripts,</li>
  <li>Bookmarking and exporting candidate variants,</li>
  <li>Analyzing multiple genes with <a href='http://gene.iobio.io'>gene.iobio</a>,</li>
  <li>Generating gene lists from phenotype terms using the <a href='http://phenolyzer.usc.edu'>Phenolyzer</a> tool from <a href='http://genomics.usc.edu'>USC</a>,</li>
  <li>Calling variants interactively with <a href='https://github.com/ekg/freebayes'>Freebayes</a>,</li>
  <li>Performing analysis with affected/unaffected siblings,</li>
  <li>Importing candidate variants from e.g. GEMINI and interrogating with <a href='http://gene.iobio.io'>gene.iobio</a>.</li>
</ol>

We have included a series of menu buttons down the left hand side of the screen where all the analysis functionality is now accessible. When a button is selected, a panel is opened containing all the actions or information associated with the selected function. We will not discuss all of the buttons in this post (they will all be covered in the remainder of this series), but will demonstrate one of the panels. The image below shows the tutorial <a href='http://gene.iobio.io/?rel0=proband&rel1=mother&rel2=father&name0=&vcf0=https://s3.amazonaws.com/iobio/gene/wgs_platinum/platinum-trio.vcf.gz&bam0=https://s3.amazonaws.com/iobio/gene/wgs_platinum/NA12878.bam&name1=&vcf1=https://s3.amazonaws.com/iobio/gene/wgs_platinum/platinum-trio.vcf.gz&bam1=https://s3.amazonaws.com/iobio/gene/wgs_platinum/NA12892.bam&name2=&vcf2=https://s3.amazonaws.com/iobio/gene/wgs_platinum/platinum-trio.vcf.gz&bam2=https://s3.amazonaws.com/iobio/gene/wgs_platinum/NA12891.bam&sample0=NA12878&sample1=NA12891&sample2=NA12892&genes=&gene=RAI1' target='_app'>usecase</a> for the RAI1 gene.

<div><img src="/public/images/blog/gene_version2/inspect.png" style="width:100%; margin: 20px 0"></img></div>

If we mouse over a variant in the proband card, a tooltip appears with limited details about the variant. We have included in this tooltip the allele counts for the reference, alternate and other alleles (in the event of a sample showing more than two alleles due to e.g. error, mosaicism etc.) for all samples. The called zygosity for each of the samples is included next to the counts, so it is really easy to compare the calls across the family. If we want to know more details, click the variant and the left panel immediately jumps to 'Inspect' and is populated with additional details about the variant, including, where applicable, links out to ClinVar, NCBIs dbSNP database etc. We will be continuing to add more information to this panel as time goes by and will strive to address any of your <a href="mailto:iobioproject@gmail.com" subject="gene.iobio suggestions">suggestions or comments</a>.

We recommend trying out all the new features for yourself, including the powerful new <a href='http://phenolyzer.usc.edu'>Phenolyzer</a> tool, accessible by clicking the 'Genes' button and entering a phenotype, for example, 'lactic acidosis'. All the new features will be discussed in this blog series that we will be releasing regularly over the coming weeks. Remember, you can still access all resources, including <a href='http://gene.iobio.io'>gene.iobio</a> tours, tutorial use cases, screencasts, blogs etc. by clicking the 'About' button.
