---
layout: post
title: Latest Exome sequencing in gene.iobio
image: /public/images/blog/gene_iobio_exome_featured_image.png
subtitle: Analyzing a trio with iobio
tags:
  - Alistair Ward
---

Exome data has unique characteristics, which affects the way the data is checked and analyzed. In this post, we will use exome data from a 1000 Genomes project trio to highlight some iobio features that are particularly useful when analyzing exome data.

The first step in the analysis is to ensure that the data quality is sufficiently high. We use bam.iobio to check the global statistics of the alignment files, which we can view <a href="http://bam.iobio.io/?bam=https://s3.amazonaws.com/iobio/1000gSV/NA19238.mapped.ILLUMINA.bwa.YRI.exome.20130415.bam&region=1" target="_new">here</a>.


<div style="text-align:center">
	<img src="/public/images/blog/bam_iobio_exome_data.png" style="width:80%"/>
</div>

A noticeable problem with this view for exome alignments is that since the majority of the genome has zero coverage, the read coverage chart is dominated by the zero coverage bases. To focus on the exome only, we can select the 'Default Bed' option (highlighted in the above plot) to use the 1000 Genomes human exome targets file to focus sampling in these regions. 

<div style="text-align:center">
	<img src="/public/images/blog/bam_iobio_exome_data_coverage_w_bed.png" style="width:70%"/>
</div>

When only considering the targeted exome, the coverage is encouragingly generally greater than 60X. 

Now, we want to look at the alignments and the variant calls for the trio. We will look at a few different genes, beginning with <a href="http://gene.iobio.io/?rel0=proband&rel1=mother&rel2=father&gene=BRCA2&name0=NA19240&bam0=https://s3.amazonaws.com/iobio/1000gSV/NA19240.mapped.ILLUMINA.bwa.YRI.exome.20130415.bam&name1=NA19238&bam1=https://s3.amazonaws.com/iobio/1000gSV/NA19238.mapped.ILLUMINA.bwa.YRI.exome.20130415.bam&name2=NA19239&bam2=https://s3.amazonaws.com/iobio/1000gSV/NA19239.mapped.ILLUMINA.bwa.YRI.exome.20130415.bam&vcf0=https://s3.amazonaws.com/iobio/1000gSV/exome-trio.vcf.gz&sample0=NA19240&vcf1=https://s3.amazonaws.com/iobio/1000gSV/exome-trio.vcf.gz&sample1=NA19238&vcf2=https://s3.amazonaws.com/iobio/1000gSV/exome-trio.vcf.gz&sample2=NA19239" target="_new">BRCA2</a>. We know that the 1000 Genomes samples were over 18 years of age and healthy at the time of DNA collection, but we can see that the father is carrying a heterozygous variant identified as possibly damaging by PolyPhen and deleterious by Sift in one of the exons. Snpeff identifies this variant as having a moderate impact and we can also see that the child (identified as the proband in this trio) has inherited this allele from her father. This variant appears as the highest ranked in the 'Rank Variants' table.

<div style="text-align:center">
	<img src="/public/images/blog/gene_iobio_exome_data.png" style="width:100%"/>
</div>

Now, let's take a look at the <a href="http://gene.iobio.io/?rel0=proband&rel1=mother&rel2=father&gene=CFTR&name0=NA19240&bam0=https://s3.amazonaws.com/iobio/1000gSV/NA19240.mapped.ILLUMINA.bwa.YRI.exome.20130415.bam&name1=NA19238&bam1=https://s3.amazonaws.com/iobio/1000gSV/NA19238.mapped.ILLUMINA.bwa.YRI.exome.20130415.bam&name2=NA19239&bam2=https://s3.amazonaws.com/iobio/1000gSV/NA19239.mapped.ILLUMINA.bwa.YRI.exome.20130415.bam&vcf0=https://s3.amazonaws.com/iobio/1000gSV/exome-trio.vcf.gz&sample0=NA19240&vcf1=https://s3.amazonaws.com/iobio/1000gSV/exome-trio.vcf.gz&sample1=NA19238&vcf2=https://s3.amazonaws.com/iobio/1000gSV/exome-trio.vcf.gz&sample2=NA19239" target="_new">CFTR gene</a>.

<div style="text-align:center">
	<img src="/public/images/blog/gene_iobio_exome_data_cftr.png" style="width:100%"/>
</div>

When we open gene.iobio in the CFTR gene, we are presented with the canonical transcript. We can immediately see that there is coverage in all three samples in what appears to be an intronic location. This situation is likely the result of an exon present in an alternative transcript for this gene. To check, we can use the 'Transcript' drop-down menu and look at all the other available transcripts. The processed transcript (i.e. a transcript that does not contain an open reading frame) highlighted in the figure below appears to have an exon in the location with coverage.


<div style="text-align:center">
	<img src="/public/images/blog/gene_iobio_transcript_menu_cftr.png" style="width:60%"/>
</div>

When selected, we see that this coverage peak indeed fell within this exon.

<div style="text-align:center">
	<img src="/public/images/blog/gene_iobio_alt_transcript_cftr.png" style="width:40%"/>
</div>

Finally, we will look at the <a href="http://gene.iobio.io/?rel0=proband&rel1=mother&rel2=father&gene=ABCB10&name0=NA19240&bam0=https://s3.amazonaws.com/iobio/1000gSV/NA19240.mapped.ILLUMINA.bwa.YRI.exome.20130415.bam&name1=NA19238&bam1=https://s3.amazonaws.com/iobio/1000gSV/NA19238.mapped.ILLUMINA.bwa.YRI.exome.20130415.bam&name2=NA19239&bam2=https://s3.amazonaws.com/iobio/1000gSV/NA19239.mapped.ILLUMINA.bwa.YRI.exome.20130415.bam&vcf0=https://s3.amazonaws.com/iobio/1000gSV/exome-trio.vcf.gz&sample0=NA19240&vcf1=https://s3.amazonaws.com/iobio/1000gSV/exome-trio.vcf.gz&sample1=NA19238&vcf2=https://s3.amazonaws.com/iobio/1000gSV/exome-trio.vcf.gz&sample2=NA19239" target="_new">ABCB10 gene</a>.  This gene shows the opposite situation to what we observed in the CFTR gene. The final coding sequence (CDS) in the canonical transcript has no coverage in any of the samples. A quick check of the 1000 Genomes project exome targets bed file reveals that this exon is included and so coverage would be expected at this location. If it were the case that any of the samples harbored a deleterious mutation in this CDS, it would not be identified from this sequencing experiment, since no DNA sequence is present within it. This is a known cause of false negative variants, i.e. variants that are not called when they do exist and can quickly and easily be identified within gene.iobio.

<div style="text-align:center">
	<img src="/public/images/blog/gene_iobio_exome_data_abcb10.png" style="width:70%"/>
</div>
