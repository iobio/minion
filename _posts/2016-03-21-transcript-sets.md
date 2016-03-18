---
layout: post
title: GENCODE or RefSeq?
image: /public/images/blog/gene-sets/main.png
subtitle: Which gene set and transcript should I use?
tags:
  - Alistair Ward
  - gene.iobio
---
Continuing the blog post series accompanying the <a href='http://gene.iobio.io'>gene.iobio</a> version 2 release, we will discuss how to choose between the <a href='http://www.gencodegenes.org', target="_blank">GENCODE</a> and <a href='http://www.ncbi.nlm.nih.gov/RefSeq', target="_blank">RefSeq</a> transcript sets and then different gene transcripts within each set. We will look at a number of different questions about these sets, but you can always take a look at this <a href='http://bmcgenomics.biomedcentral.com/articles/10.1186/1471-2164-16-S8-S2' target="_blank">paper</a> for a more detailed discussion. This is another interesting <a href='http://genomemedicine.biomedcentral.com/articles/10.1186/gm543', target="_blank">paper</a> discussing the significant functional annotations achieved by using different software and transcripts.

<strong><i>How do I select a set?</i></strong>  
Before getting into some more detail about the details of the two sets, let's first see how to choose which gene set to use. 

<div><img src="/public/images/blog/gene-sets/selector.png" style="width:100%; margin:20px 0px;"></img></div>

Click the gene set selector wheel to select between the GENCODE and the RefSeq sets and then use the transcript selector to select the desired transcript.
<div><img src="/public/images/blog/gene-sets/selectors.png" style="width:100%; margin:20px 0px;"></img></div>

It's that easy! When you change to a different transcript, <a href='http://gene.iobio.io'>gene.iobio</a> will reannotate all of the gene variants based on the new transcript. Depending on how different the transcripts are, this can lead to big changes. For example, the <a href='http://gene.iobio.io/usecases.html#PDGFB'>PDGFB</a> usecase shows the example of an intronic variant in one transcript being reannotated as a high-impact frameshift mutation in a different transcript.

<div style='font-size:30px;'><strong><i>Some details about the two gene sets</i></strong></div>  
<strong><i>GENCODE gene set</i></strong>
<ol type="1">
  <li>The GENCODE consortium was set up to provide reference gene annotations for the <a href='http://www.genome.gov/ENCODE', target="_blank">ENCODE</a> project,</li>
  <li>Aims to be comprehensive, e.g. include psedogenes, long non-coding RNAs (lncRNAs), short RNAs as well as protein-coding transcripts,</li>
  <li>Includes extensive manual annotation by the HAVANA group, as well as computational annotation. Approximately <a href='http://bmcgenomics.biomedcentral.com/articles/10.1186/1471-2164-16-S8-S2' target="_blank">93.4%</a> of the annotations involve manual annotation,</li>
  <li>Is undergoing constant validation by many groups in the consortium,</li>
  <li>Is the default annotation set used by the <a href='http://www.ensembl.org', target="_blank">Ensembl</a> project.</li>
</ol>

<strong><i>RefSeq gene set</i></strong>
<ol type="1">
  <li>Widely used gene set produced by the <a href='', target="_blank">NCBI</a>.</li>
  <li>Has significant manually annotated content, but much less than GENCODE (<a href='http://bmcgenomics.biomedcentral.com/articles/10.1186/1471-2164-16-S8-S2' target="_blank">~45%</a> of transcripts are listed as MODEL).</li>
  <li>Transcripts are names as:
    <ul>
      <li>NM: Manually curated, protein-coding transcripts,</li>
      <li>NR: Non-coding transcrips,</li>
      <li>XM: Predicted protein-coding models.</li>
    </ul>
  </li>
</ol>

<strong><i>So which set should I use?</strong></i>  
It may be that the your lab uses a particular set of transcripts and has good reason for the choice, so it is probably a good idea to use what your lab/collaborators use. If you want to see more transcript options (including, e.g. pseudogenes), GENCODE would be the choice for you.
