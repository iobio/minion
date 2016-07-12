---
layout: post
title: Phenolyzer
image: /public/images/blog/phenolyzer/main.png
subtitle: How do I generate phenotype driven gene lists?
tags:
  - Alistair Ward
  - gene.iobio
---
A <a href='http://iobio.io/2016/03/28/multi-gene/' target="_blank">previous post</a> in the <a href='http://gene.iobio.io' target="_blank">gene.iobio</a> version 2 blog series focused on analyzing multiple genes simultaneously. This functionality has really increased the power of <a href='http://gene.iobio.io' target="_blank">gene.iobio</a>, making it a lot easier to analyze a set of genes and identify candidate disease variants. The problem is, though, that we still need to generate a list of genes to analyze. As described in the <a href='http://iobio.io/2016/03/29/acmg56/' target="_blank">previous post</a>, we can start with the list of 56 genes identified by the ACMG, but what would be ideal, would be start with a phenotype and generate a gene list from there. Fortunately, that is exactly what we can do!

In this post, we will use the modified <a href='http://gene.iobio.io/?rel0=proband&rel1=mother&rel2=father&name0=&vcf0=https://s3.amazonaws.com/iobio/gene/wgs_platinum/platinum-trio.vcf.gz&bam0=https://s3.amazonaws.com/iobio/gene/wgs_platinum/NA12878.bam&name1=&vcf1=https://s3.amazonaws.com/iobio/gene/wgs_platinum/platinum-trio.vcf.gz&bam1=https://s3.amazonaws.com/iobio/gene/wgs_platinum/NA12892.bam&name2=&vcf2=https://s3.amazonaws.com/iobio/gene/wgs_platinum/platinum-trio.vcf.gz&bam2=https://s3.amazonaws.com/iobio/gene/wgs_platinum/NA12891.bam&sample0=NA12878&sample1=NA12891&sample2=NA12892&genes=RAI1&gene=RAI1' target='_blank'>Platinum trio</a> dataset and assume this data originates from a family trio where the child is suffering from <i>lactic acidosis</i>. If we know a lot about this phenotype, we may know of some likely genes where we can start our analysis, but what if we do not? Or what if these genes turn up no candidate variants? Using <a href='http://phenolyzer.usc.edu/' target='_blank'>Phenolyzer</a>, a tool developed in the lab of <a href='http://genomics.usc.edu/' target='_blank'>Kai Wang</a> at <a href='http://www.usc.edu/' target='_blank'>USC</a>, we can use the phenotype to generate a gene list. For more information on this tool, or other software developed in this lab, go <a href='http://genomics.usc.edu/research' target='_blank'>here</a>.

To use <a href='http://phenolyzer.usc.edu/' target='_blank'>Phenolyzer</a>, click on the \'Genes\' button to the left of the <a href='http://gene.iobio.io' target="_blank">gene.iobio</a> screen and then enter your phenotype terms where indicated.

<div><img src="/public/images/blog/phenolyzer/phenolyzer.png" style="width:55%; margin:20px 120px;"></img></div>

In this case, we enter <i>lactic acidosis</i>, click \'Run\' and wait for <a href='http://phenolyzer.usc.edu/' target='_blank'>Phenolyzer</a> to do its magic! Very briefly, <a href='http://phenolyzer.usc.edu/' target='_blank'>Phenolyzer</a> works by trying to match the entered phenotype terms to disease and phenotype terms in its own database to produce a list of seed genes. These genes are then checked for interactions with all other genes in the genome, accounting for four types of interaction; protein-protein interactions, genes in the same Biosystem or the same gene family and in transcription interactions. Based on all of this, a machine learning model is used to generate a score for each gene, and the output is a list of genes ordered by their scores.  The output gene list for <i>lactic acidosis</i> appears in the left panel and the top 10 (this number is user configurable) genes appear as gene badges, ready to be interrogated.

<div><img src="/public/images/blog/phenolyzer/phenolyzer-list.png" style="width:100%; margin:20px 0px;"></img></div>

By default, the genes are not automatically analyzed, but we can select \'Analyze all\' to begin analysis. When complete, the gene badges describe any interesting variants within them using the glyphs described in the <a href='http://iobio.io/2016/03/28/multi-gene/' target="_blank">multi-gene analysis post</a>.

<div><img src="/public/images/blog/phenolyzer/gene-badges.png" style="width:100%; margin:20px 0px;"></img></div>

The gene badges are in the prioritized order, so the gene to the furthest left (TTPA) is considered the most important by <a href='http://phenolyzer.usc.edu/' target='_blank'>Phenolyzer</a>. The RAI1 gene still appears in the gene badges, since this was present prior to running Phenolyzer. We can see that there are no glyphs associated with the TTPA gene, so there are no high impact variants to look at there. The highest ranked gene that does have interesting variants to look at is PDHA1, so that is the first gene we should look at. In this gene, we see only two variants; an insertion in a promoter and a <i>de novo</i> missense variant predicted to be <i>deleterious</i> by SIFT and <i>probably_damaging</i> by PolyPhen. The variant is not seen in either 1000 Genomes or in ExAC, so this variant may well be a good candidate for the obseved phenotype.

<div><img src="/public/images/blog/phenolyzer/pdha1.png" style="width:75%; margin:20px 100px;"></img></div>

We hope that you find this functionality useful and we would like to thank Kai Wang and his lab for allowing <a href='http://phenolyzer.usc.edu/' target='_blank'>Phenolyzer</a> to be integrated into <a href='http://gene.iobio.io' target="_blank">gene.iobio</a>.
