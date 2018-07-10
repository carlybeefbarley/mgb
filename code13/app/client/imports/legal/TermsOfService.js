import React from 'react'
import { Container, Header } from 'semantic-ui-react'
import Footer from '/client/imports/components/Footer/Footer'

const lastUpdateDate = 'May 3rd, 2017'

const supportEmail = 'support@mycodebuilder.com'
const copyrightInfringmentEmail = supportEmail

const privacyUrl = '/legal/privacy'

// TODO: This is the main section that needs revision - need to allow overrides to default license.
const licenseMitLink = <a href="http://opensource.org/licenses/MIT">MIT license</a>

const whatsNewPage = '/whatsnew'
const supportUrl = '/legal/tos?_fp=chat.G_MGBBUGS_'
const thisSiteUrl = 'MyGameBuilder.com'
const thisSiteName = 'MyGameBuilder'
const thisSiteName_Site = `${thisSiteName} Site`
const thisSiteName_SiteCAPS = thisSiteName_Site.toUpperCase()

const ageMinimumToUse = 13
const ageMinimumToJoin = 18

const assetTerm = 'Asset'
const companyName = 'MyCodeBuilder'
const companyNameCAPS = companyName.toUpperCase()
const companyNameInc = 'MyCodeBuilder, Inc.'
const companyAddress = 'Seattle, WA, 98105'

// Unsure why, but stardust Table isn't working so...
const Table = props => <table className="ui two column celled table">{props.children}</table>
Table.Header = props => <thead>{props.children}</thead>
Table.HeaderCell = props => <th>{props.children}</th>
Table.HeaderCellL = props => <th className="ten wide">{props.children}</th>
Table.HeaderCellR = props => <th className="six wide">{props.children}</th>
Table.Row = props => <tr>{props.children}</tr>
Table.Body = props => <tbody>{props.children}</tbody>
Table.Data = props => <td>{props.children}</td>

const LegalTableHeader = () => (
  <Table.Header>
    <Table.Row>
      <Table.HeaderCellL>Official legally binding terms</Table.HeaderCellL>
      <Table.HeaderCellR>
        Summary <small>(not legal advice)</small>
      </Table.HeaderCellR>
    </Table.Row>
  </Table.Header>
)

const LegalSection = props => (
  <div>
    <Header as="h3" content={props.banner} style={{ marginTop: '2em' }} />
    {props.extraText && <p>{props.extraText}</p>}
    <Table>
      <LegalTableHeader />
      <Table.Body>{props.children}</Table.Body>
    </Table>
  </div>
)
const DBAJ = () => <span>Don't be annoying or malicious</span> // Don't be a jerk'

const TermsOfService = () => (
  <div>
    <Container>
      <LegalSection banner="Terms of Service">
        <Table.Row>
          <Table.Data>
            These Terms of Service (the “<strong>Terms of Service</strong>”) are a contract between you, the
            user, and {companyNameInc}, a Washington corporation with its principal place of business in{' '}
            {companyAddress} (“<strong>{companyName}</strong>”).&ensp;
            {companyName} operates {thisSiteUrl} (the “<strong>{thisSiteName_Site}</strong>”) and the{' '}
            {assetTerm} creation service therein. By using the {thisSiteName_Site} and any services accessible
            from the {thisSiteName_Site}, you are agreeing to be bound by these Terms of Service. If you do
            not agree to these Terms of Service or any part thereof, your only remedy is to not use the{' '}
            {thisSiteName_Site} or any services or products offered on the {thisSiteName_Site} or on any other
            platform, including mobile applications, offered by {companyName} (collectively, the “Service” or
            “Services”). VIOLATION OF ANY OF THE TERMS OF SERVICE BELOW WILL RESULT IN THE TERMINATION OF YOUR
            RIGHT TO USE THE SERVICE, AND ANY ACCOUNT THAT YOU MAY HAVE CREATED AS PART OF THE SERVICE. YOU
            AGREE TO USE THE SERVICE AT YOUR OWN RISK. {companyName} reserves the right to refuse service to
            anyone for any reason at any time.
          </Table.Data>
          <Table.Data>
            By being a member and using {thisSiteName}, you agree to everything on this page. We have to do
            this to protect both you and us and make running this business possible. If you break these terms,
            you can't use {thisSiteName} anymore.
          </Table.Data>
        </Table.Row>
      </LegalSection>

      <LegalSection banner="Your Account">
        <Table.Row>
          <Table.Data>
            In order to open an account on the {thisSiteName_Site} (the “<strong>Account</strong>”), you must
            (i) agree to these Terms of Service, and (ii) provide any other information required by{' '}
            {companyName} during the registration process. You will update this information to maintain its
            accuracy during the time you are using the Service. You are responsible for maintaining the
            security of your account and password. {companyName} cannot and will not be liable for any loss or
            damage from your failure to comply with this security obligation. You are also responsible for all
            content, code, features, comments, graphics or text that you may post on the
            {thisSiteName_Site} (the “<strong>Content</strong>”) and activity that occurs under your Account
            (even when Content is posted by others who have access to your Account). Any information submitted
            by you shall be subject to {companyName} <a href={`${privacyUrl}`}>Privacy Policy</a>. One person
            or legal entity may not maintain more than one Account. Accounts registered by “bots” or other
            automated methods are not permitted.
          </Table.Data>
          <Table.Data>
            Your account is your responsibility. If your account is compromised we'll try to help, but we
            can't guarantee we can fix any damages.
          </Table.Data>
        </Table.Row>
      </LegalSection>

      <LegalSection banner="Our License to You">
        <Table.Row>
          <Table.Data>
            {companyName} hereby grants you a non-exclusive, non-transferable, worldwide right to access and
            use the {thisSiteName_Site}, solely with supported browsers through the Internet for your own
            internal purposes, subject to these Terms of Service. You may not permit the {thisSiteName_Site}{' '}
            to be used by or for the benefit of unauthorized third parties. Nothing in the Terms of Service
            shall be construed to grant you any right to transfer or assign rights to access or use the{' '}
            {thisSiteName_Site}. All rights not expressly granted to you are reserved by {companyName} and its
            licensors. You shall not (i) modify or make derivative works based upon the {thisSiteName_Site};
            (ii) reverse engineer or access the {thisSiteName_Site} in order to (a) build a competitive
            product or service, (b) build a product using similar features, functions or graphics of the{' '}
            {thisSiteName_Site}, or (c) copy any features, functions or graphics of the {thisSiteName_Site}.
            You further acknowledge and agree that, as between the parties, {companyName} owns all right,
            title, and interest in and to the&ensp;
            {thisSiteName_Site}, including all intellectual property rights therein.
          </Table.Data>
          <Table.Data>Don't copy {thisSiteName} itself.</Table.Data>
        </Table.Row>
      </LegalSection>

      <LegalSection banner="Your License to Us">
        <Table.Row>
          <Table.Data>
            By submitting, posting or displaying Content on the {thisSiteName_Site}, by default (and unless
            otherwise specified) you grant
            {companyName} and other users of the Services a worldwide, non-exclusive, royalty-free license
            (with the right to sublicense) to use, copy, reproduce, process, adapt, modify, publish, transmit,
            display and distribute such Content in any and all media or distribution methods (now known or
            later developed). Specifically, the
            {licenseMitLink}.
            {thisSiteName_Site} also allows users to explicitly choose some other externally defined licenses
            on a per-asset basis, in which case the license grants are as described by the legal terms that
            the selected license links to.
          </Table.Data>
          <Table.Data>
            By default and unless otherwise specified, public {assetTerm}s you build on {thisSiteName} are{' '}
            {licenseMitLink}d, meaning other people are free to use them for whatever they like as long as
            that is also MIT licensed. Don't put anything on {thisSiteName} where that wouldn't be OK.&ensp;
            You may choose from some other licenses for each asset, in which case see the terms for each
            license at the sites which host those license descriptions
          </Table.Data>
        </Table.Row>
        <Table.Row>
          <Table.Data>
            You agree that this license includes the right for {companyName} and other users of the Services
            to make your Content available to others for the publication, distribution, syndication, or
            broadcast of such Content on other media and services, subject to our terms and conditions for
            such Content use. Such additional uses by {companyName} or others may be made with no compensation
            paid to you with respect to the Content that you submit, post, transmit or otherwise make
            available through the Services.
          </Table.Data>
          <Table.Data>People don't have to pay you to use the things you make on {thisSiteName}.</Table.Data>
        </Table.Row>
        <Table.Row>
          <Table.Data>
            {companyName} may modify or adapt your Content in order to transmit, display or distribute it over
            computer networks and in various media and/or make changes to your Content as are necessary to
            conform and adapt that Content to any requirements or limitations of any networks, devices,
            services or media.
          </Table.Data>
          <Table.Data>
            People can fork your work and modify it.&ensp; You can disable forking for projects to make it
            less convenient for other users to fork an entire project, but individual assets can always be
            forked by other users.
          </Table.Data>
        </Table.Row>
        <Table.Row>
          <Table.Data>
            Additionally, by uploading Content to the {thisSiteName_Site}, you warrant, represent and agree
            that you have the right to grant {companyName} the license(s) described above. You also represent,
            warrant and agree that you have not and will not contribute any Content that (a) infringes,
            violates or otherwise interferes with any copyright or trademark of another party, (b) reveals any
            trade secret, unless the trade secret belongs to you or you have the owner's permission to
            disclose it, (c) infringes any intellectual property right of another or the privacy or publicity
            rights of another, (d) is libelous, defamatory, abusive, threatening, harassing, hateful,
            offensive or otherwise violates any law or right of any third party, (e) creates an impression
            that you know is incorrect, misleading, or deceptive, including by impersonating others or
            otherwise misrepresenting your affiliation with a person or entity; (f) contains other people's
            private or personally identifiable information without their express authorization and permission,
            and/or (g) contains or links to a virus, trojan horse, worm, time bomb or other computer
            programming routine or engine that is intended to damage, detrimentally interfere with,
            surreptitiously intercept or expropriate any system, data or information. {companyName} reserves
            the right in its discretion to remove any Content from the {thisSiteName_Site}, suspend or
            terminate your account at any time, or pursue any other remedy or relief available under equity or
            law.
          </Table.Data>
          <Table.Data>
            Don't put nasty or copyright-infringing things on {thisSiteName}. This is a positive community and
            if you want to troll, you should go somewhere else
          </Table.Data>
        </Table.Row>
        <Table.Row>
          <Table.Data>
            You are responsible for your use of the Service, for any Content you provide, and for any
            consequences thereof, including the use of your Content by other users and third party partners.
            You understand that your Content may be republished and if you do not have the right to submit
            Content for such use, it may subject you to liability. {companyName} will not be responsible or
            liable for any use of your Content in accordance with these Terms of Service.
          </Table.Data>
          <Table.Data>
            Don't use {thisSiteName} to do bad things. If you do, we'll remove your account and you personally
            are responsible for any trouble you cause.
          </Table.Data>
        </Table.Row>
      </LegalSection>

      <LegalSection banner="Your Responsibilities">
        <Table.Row>
          <Table.Data>
            The Services are available only to individuals who have the capacity to form legally binding
            contracts under the law applicable to these Terms of Service. Furthermore, our services are NOT
            available to minors (under {ageMinimumToJoin} years of age). If you do not qualify as an
            authorized user, you are NOT permitted to use the Services and NO CONTRACT will be formed between
            you and {companyName}.
          </Table.Data>
          <Table.Data>
            You need to be {ageMinimumToJoin} or older to sign up for {thisSiteName}. We need these rules to
            be legally binding and you have to be {ageMinimumToJoin} or older for that to be possible.
          </Table.Data>
        </Table.Row>
        <Table.Row>
          <Table.Data>
            {companyName} relies upon parents or guardians {ageMinimumToJoin} years of age or older to
            determine if the {thisSiteName_Site} and Services are appropriate for the viewing, access, or
            participation by such individuals under the age of {ageMinimumToJoin}. We do not seek or knowingly
            collect any personal information about children under {ageMinimumToUse} years of age. If we become
            aware that we have unknowingly collected personal information from a child under the age of{' '}
            {ageMinimumToUse}, we will make commercially reasonable efforts to delete such information from
            our database.
          </Table.Data>
          <Table.Data>
            If you are under {ageMinimumToUse}, you can't use {thisSiteName} (sorry).<br />
            If you are {ageMinimumToUse} or over but under {ageMinimumToJoin}, have your legal guardian sign
            up for you.
          </Table.Data>
        </Table.Row>
        <Table.Row>
          <Table.Data>
            As a condition of your use of the Services, you agree to (a) provide {companyName}
            with true, accurate, current and complete information as prompted by the {thisSiteName}
            registration forms, when registering for or using the Services and (b) update and maintain the
            truthfulness, accuracy and completeness of such information.
          </Table.Data>
          <Table.Data>Don't lie on the sign up form.</Table.Data>
        </Table.Row>
        <Table.Row>
          <Table.Data>
            You are responsible for all activity occurring under your Accounts and are solely responsible for
            compliance with all applicable local, state, national and foreign laws, treaties and regulations
            relating to your use of the {thisSiteName_Site}, including those related to the protection of
            intellectual property, data privacy, international communications and the transmission of
            technical or personal data.
          </Table.Data>
          <Table.Data>
            Follow all laws that apply to you, based on where you live or anything else.
          </Table.Data>
        </Table.Row>
        <Table.Row>
          <Table.Data>
            You shall: (i)
            <a href={supportUrl}>notify {companyName}</a>
            immediately of any unauthorized use of any password or account or any other known or suspected
            breach of security; and (ii) report to {companyName} immediately and use reasonable efforts to
            stop immediately any copying or distribution of Content that is known or suspected by you.
          </Table.Data>
          <Table.Data>
            If your account is hacked,
            <a href={supportUrl}>let us know</a>
            right away.
          </Table.Data>
        </Table.Row>
        <Table.Row>
          <Table.Data>
            You are responsible for obtaining and maintaining any equipment and ancillary services needed to
            connect to, access or otherwise use the {thisSiteName_Site}, including, without limitation,
            modems, hardware, server, software, Internet browsers operating system, networking, web servers,
            long distance and local telephone service, but excluding the {thisSiteName_Site} itself
            (collectively, “<strong>Equipment</strong>”). You shall be responsible for ensuring that such
            Equipment is compatible with the
            {thisSiteName_Site}. You shall also be responsible for the use, and maintaining the security, of
            the Equipment.
          </Table.Data>
          <Table.Data>You pay for your own electricity, internet, computer, web browser, etc.</Table.Data>
        </Table.Row>
        <Table.Row>
          <Table.Data>
            All Content, whether publicly posted or privately transmitted, is the sole responsibility of the
            person who originated such Content. We may not monitor or control the Content posted via the
            Services. Any use of or reliance on any Content or materials posted via the Services or obtained
            by you through the Services is at your own risk. We do not endorse, support, represent or
            guarantee the completeness, truthfulness, accuracy, or reliability of any Content or
            communications posted via the Services or endorse any opinions expressed via the Services. You
            understand that by using the Services, you may be exposed to Content that might be offensive,
            harmful, inaccurate or otherwise inappropriate. Under no circumstances will {companyName} be
            liable in any way for any Content, including, but not limited to, any errors or omissions in any
            Content, or any loss or damage of any kind incurred as a result of the use of any Content made
            available via the Services or broadcast elsewhere.
          </Table.Data>
          <Table.Data>
            We don't monitor every single thing on {thisSiteName}. It's up to you to do right.
          </Table.Data>
        </Table.Row>
      </LegalSection>

      <LegalSection
        banner="Impermissible Acts"
        extraText={`As a condition to your use of the ${thisSiteName_Site}, you agree not to:`}
      >
        <Table.Row>
          <Table.Data>
            upload, post, email, transmit or otherwise make available any information, materials or other
            content that is illegal, harmful, threatening, abusive, harassing, defamatory, obscene,
            pornographic, offensive, invades another’s privacy, or promotes bigotry, racism, hatred or harm
            against any individual or group;
          </Table.Data>
          <Table.Data>
            <DBAJ />
          </Table.Data>
        </Table.Row>
        <Table.Row>
          <Table.Data>
            impersonate any person or entity or falsely state or otherwise misrepresent your affiliation with
            a person or entity;
          </Table.Data>
          <Table.Data>
            <DBAJ />
          </Table.Data>
        </Table.Row>
        <Table.Row>
          <Table.Data>
            phish, collect, upload, post, email, transmit or otherwise make available any login data and/or
            passwords for other web sites, software or services;
          </Table.Data>
          <Table.Data>
            <DBAJ />
          </Table.Data>
        </Table.Row>
        <Table.Row>
          <Table.Data>
            phish, collect, upload, post, email, transmit or otherwise make available credit card information
            or other forms of financial data used for collecting payments;
          </Table.Data>
          <Table.Data>
            <DBAJ />
          </Table.Data>
        </Table.Row>
        <Table.Row>
          <Table.Data>
            forge headers or otherwise manipulate identifiers in order to disguise the origin of any content
            transmitted through the {thisSiteName_Site};
          </Table.Data>
          <Table.Data>
            <DBAJ />
          </Table.Data>
        </Table.Row>
        <Table.Row>
          <Table.Data>
            upload, post, email, transmit or otherwise make available any information, materials or other
            content that infringes another’s rights, including any intellectual property rights;
          </Table.Data>
          <Table.Data>
            <DBAJ />
          </Table.Data>
        </Table.Row>
        <Table.Row>
          <Table.Data>
            upload, post, email, transmit or otherwise make available any unsolicited or unauthorized
            advertising, promotional materials, “junk mail,” “spam,” “chain letters,” “pyramid schemes,” or
            any other form of solicitation;
          </Table.Data>
          <Table.Data>
            <DBAJ />
          </Table.Data>
        </Table.Row>
        <Table.Row>
          <Table.Data>
            upload, post, email, transmit or otherwise make available any material that contains software
            viruses or any other computer code, files or programs designed to interrupt, destroy or limit the
            functionality of any computer software or hardware or telecommunications equipment;
          </Table.Data>
          <Table.Data>
            <DBAJ />
          </Table.Data>
        </Table.Row>
        <Table.Row>
          <Table.Data>
            use any manual or automated software, devices, or other processes to “crawl,” “spider” or “screen
            scrape” any web pages contained in the {thisSiteName_Site};
          </Table.Data>
          <Table.Data>
            <DBAJ />
          </Table.Data>
        </Table.Row>
        <Table.Row>
          <Table.Data>
            reverse engineer, decompile or disassemble any of the software used to provide the{' '}
            {thisSiteName_Site};
          </Table.Data>
          <Table.Data>
            <DBAJ />
          </Table.Data>
        </Table.Row>
        <Table.Row>
          <Table.Data>
            reproduce, duplicate or copy or exploit any other portion of the {thisSiteName_Site}, without the
            express written permission of {companyName};
          </Table.Data>
          <Table.Data>
            <DBAJ />
          </Table.Data>
        </Table.Row>
        <Table.Row>
          <Table.Data>
            interfere with or disrupt the {thisSiteName_Site}, or any servers or networks connected to the{' '}
            {thisSiteName_Site}, or disobey any requirements, procedures, policies or regulations of networks
            connected to the {thisSiteName_Site};
          </Table.Data>
          <Table.Data>
            <DBAJ />
          </Table.Data>
        </Table.Row>
        <Table.Row>
          <Table.Data>
            obtain, collect, store or modify the personal information about other users;
          </Table.Data>
          <Table.Data>
            <DBAJ />
          </Table.Data>
        </Table.Row>
        <Table.Row>
          <Table.Data>
            modify, adapt or hack the {thisSiteName_Site} or falsely imply that some other site is associated
            with the {thisSiteName_Site} or {companyName}; or
          </Table.Data>
          <Table.Data>
            <DBAJ />
          </Table.Data>
        </Table.Row>
        <Table.Row>
          <Table.Data>
            use the {thisSiteName_Site} for any illegal or unauthorized purpose. You must not, in the use of
            the {thisSiteName_Site}, violate any laws in your jurisdiction (including but not limited to
            copyright laws).
          </Table.Data>
          <Table.Data>Don't break laws.</Table.Data>
        </Table.Row>
        <Table.Row>
          <Table.Data>
            We reserve the right at all times (but will not have an obligation) to remove or refuse to
            distribute any Content on the Service and to terminate users or reclaim usernames. We also reserve
            the right to access, read, preserve, and disclose any information as we reasonably believe is
            necessary to (i) satisfy any applicable law, regulation, legal process or governmental request,
            (ii) enforce the Terms of Service, including investigation of potential violations hereof, (iii)
            detect, prevent, or otherwise address fraud, security or technical issues, (iv) respond to user
            support requests, or (v) protect the rights, property or safety of {companyName}, its users and
            the public.
          </Table.Data>
          <Table.Data>
            We might pop into your account to help with a support/help request, but we otherwise don't go
            snooping around for information in your account that isn't already exposed to other users
            publicly.<p />
            <p>
              If we are legally required to provide information to the government that they request, we will,
              but not otherwise.
            </p>
          </Table.Data>
        </Table.Row>
      </LegalSection>

      <LegalSection banner="Feedback">
        <Table.Row>
          <Table.Data>
            In the course of using the {thisSiteName_Site}, you may provide {companyName} with feedback,
            including but not limited to suggestions, observations, errors, problems, and defects regarding
            the {thisSiteName_Site} (collectively “<strong>Feedback</strong>”). You hereby grant {companyName}{' '}
            a worldwide, irrevocable, perpetual, royalty-free, transferable and sub-licensable, non-exclusive
            right to use, copy, modify, distribute, display, perform, create derivative works from and
            otherwise exploit all such Feedback.
          </Table.Data>
          <Table.Data>
            If you send us an idea, we are allowed to use it, in which case it's protected by all the same
            rules on this page.
          </Table.Data>
        </Table.Row>
      </LegalSection>

      {/*

      <LegalSection banner='Payment, Refunds, Upgrading and Downgrading'>
        <Table.Row>
          <Table.Data>
            A valid credit card is required for paying Accounts. The {thisSiteName_Site} is billed
            in advance on a monthly basis in accordance with our pricing schedule and all
            payments are non-refundable. There will be no refunds or credits for partial
            months of Service, upgrade/downgrade refunds, or refunds for months unused with
            an open Account.
          </Table.Data>
          <Table.Data>
            All sales final.
          </Table.Data>
        </Table.Row>
        <Table.Row>
          <Table.Data>
            You will be billed for your first month immediately upon signing up for a paying
            Account. After signing up for a paying Account, you will be billed monthly
            starting on the 30th day after your account was initially created. You will be
            billed for your first month immediately upon upgrading to a paying Account or a
            higher level Account. For any upgrade or downgrade in plan level, your credit
            card that you provided will automatically be charged a pro-rated fee for the new
            level and subsequent months billed at the full rate for the chosen plan level.
          </Table.Data>
          <Table.Data>
            If you are on a monthly PRO plan, we re-bill automatically every 30 days.
          </Table.Data>
        </Table.Row>
        <Table.Row>
          <Table.Data>
            All fees are exclusive of all taxes, levies, or duties imposed by taxing
            authorities, and you shall be responsible for payment of all such taxes, levies,
            or duties, excluding only United States (federal or state) taxes. You agree to
            pay for any such taxes that might be applicable to your use of the Service and
            payments made by you herein.
          </Table.Data>
          <Table.Data>
            If you're required to pay taxes on the purchase of a {thisSiteName} PRO plan, that's on
            you.
          </Table.Data>
        </Table.Row>
        <Table.Row>
          <Table.Data>
            DOWNGRADING YOUR {thisSiteName_SiteCAPS} PLAN MAY CAUSE THE LOSS OF CONTENT, FEATURES, OR
            CAPACITY OF YOUR ACCOUNT. {companyNameCAPS} DOES NOT ACCEPT ANY LIABILITY FOR SUCH LOSS.
          </Table.Data>
          <Table.Data>
            If you downgrade from PRO to free, you won't have access to the PRO features
            anymore.
          </Table.Data>
        </Table.Row>
      </LegalSection>

      */}

      <LegalSection banner="Violation of these Terms of Service">
        <Table.Row>
          <Table.Data>
            {companyName} reserves the right to investigate and prosecute violations of any of these Terms of
            Service to the fullest extent of the law. {companyName} may involve and cooperate with law
            enforcement authorities in prosecuting users who violate the Terms of Service. You acknowledge
            that {companyName} has no obligation to pre-screen or monitor your access to or use of the{' '}
            {thisSiteName_Site} or any information, materials or other content provided or made available
            through the {thisSiteName_Site}, but has the right to do so. You hereby agree that {companyName}{' '}
            may, in the exercise of {companyName} sole discretion, remove or delete any entries, information,
            materials or other content that violates these Terms of Service or that is otherwise
            objectionable.
          </Table.Data>
          <Table.Data>
            We will delete anything that violates these rules. We have the right to take legal action against
            violations of these rules.
          </Table.Data>
        </Table.Row>
      </LegalSection>

      <LegalSection banner="Cancellation and Termination">
        <Table.Row>
          <Table.Data>You can ask to cancel your account by messaging us at {supportEmail}</Table.Data>
          <Table.Data>
            If you don't want a {thisSiteName} account anymore, it's up to you to ask us to delete it. You
            can't yet do it directly from the site (while we are in Beta) but email us at {supportEmail} and
            we will delete it for you within a commercially reasonable time
          </Table.Data>
        </Table.Row>
        <Table.Row>
          <Table.Data>
            Any cancellation of your Account will result in the deactivation or deletion of your Account or
            your access to your Account, and the forfeiture and relinquishment of all Content in your Account.
            This information cannot be recovered from {companyName} once your Account is cancelled. Please be
            aware that
            {companyName} may for a time retain residual information in our backup and/or archival copies of
            our database. We will make reasonable commercial efforts to delete your information as soon as
            possible after you communicate that intention to us.
          </Table.Data>
          <Table.Data>
            If you ask us to delete your account, you accept that everything in it is gone forever.
          </Table.Data>
        </Table.Row>
        <Table.Row>
          <Table.Data>
            {companyName}, in its sole discretion, has the right to suspend or terminate your Account if (1)
            you breach these Terms of Service or (2) your bandwidth usage significantly exceeds the average
            bandwidth of other users of the Service. In each such case {companyName} may refuse to provide you
            any current or future use of the {thisSiteName_Site}, or any other Service. Any termination of
            your Account will result in the deactivation or deletion of your Account or your access to your
            Account, and the forfeiture and relinquishment of all Content in your Account. This information
            cannot be recovered from {thisSiteName} once your account is terminated; however {companyName} may
            for a time retain residual information in our backup and/or archival copies of our database.
          </Table.Data>
          <Table.Data>
            Don't use {thisSiteName} for asset storage for non-{thisSiteName} things. If your game or assets
            become very popular we may have to ask you to host the content elsewhere instead so that we can
            still afford to feed our dogs
          </Table.Data>
        </Table.Row>
      </LegalSection>

      <LegalSection banner={`Modifications to the ${thisSiteName_Site} and Prices`}>
        <Table.Row>
          <Table.Data>
            {companyName} reserves the right at any time and from time to time to modify or discontinue,
            temporarily or permanently, the {thisSiteName_Site} and Service (or any part thereof) with or
            without notice.
          </Table.Data>
          <Table.Data>
            We have no intention to shut down, but it is possible we might have to. C'est la vie.
          </Table.Data>
        </Table.Row>

        {/*

        <Table.Row>
          <Table.Data>
            Prices of all {companyName} Sites, including but not limited to monthly subscription
            plan fees to the {thisSiteName_Site}, are subject to change upon 30 days notice from
            {companyName}. Such notice may be provided at any time by posting the changes to the
            {thisSiteName_Site}.
          </Table.Data>
          <Table.Data>
            If we change prices we'll give you 30 days notice.
          </Table.Data>
        </Table.Row>

        */}

        <Table.Row>
          <Table.Data>
            {companyName} shall not be liable to you or to any third party for any modification, price change,
            suspension or discontinuance of the {thisSiteName_Site}.
          </Table.Data>
          <Table.Data>
            Hopefully any change we make to the site is for the better, but if we change something you don't
            like, it will be up to you to decide if you want to stay.
          </Table.Data>
        </Table.Row>
        <Table.Row>
          <Table.Data>
            {companyName} reserves the right to update and change the Terms of Service from time to time
            without notice. Any new features that augment or enhance the current
            {thisSiteName_Site}, including the release of new tools and resources, shall be subject to the
            Terms of Service. Continued use of the {thisSiteName_Site} after any such changes shall constitute
            your consent to such changes.
          </Table.Data>
          <Table.Data>
            This page might change from time to time. We'll let you know through the in-app notification
            systems at {whatsNewPage} of any major changes.
          </Table.Data>
        </Table.Row>
      </LegalSection>

      <LegalSection banner="Copyright and Content Ownership">
        <Table.Row>
          <Table.Data>
            All right, title, and interest in and to the Services (excluding Content provided by you), are and
            will remain the exclusive property of {companyName} and its licensors. The Services are protected
            by copyright, trademark, and other laws of both the United States and foreign countries. Nothing
            in the Terms of Service gives you a right to use the {thisSiteName} name or any of the{' '}
            {companyName} trademarks, logos, domain names, and other distinctive brand features. You
            acknowledge that the ownership in any intellectual property rights (including, for the avoidance
            of doubt, patents, copyright, rights in databases, trademarks and trade names whether registered
            or unregistered and subsisting anywhere in the world) in the Services belongs to {companyName} or
            its third party licensors. Accordingly, any part of the Services may not be used, transferred,
            copied or reproduced in whole or in part in any manner other than for the purposes of utilizing
            the Services.
          </Table.Data>
          <Table.Data>
            The original things that you make on {thisSiteName} are yours, "{thisSiteName}" is ours.
          </Table.Data>
        </Table.Row>
      </LegalSection>

      <LegalSection banner="Notification of Claims of Infringement">
        <Table.Row>
          <Table.Data>
            If you believe that your work has been copied in a way that constitutes copyright infringement, or
            your intellectual property rights have been otherwise violated, please notify {companyName}'s'
            agent for notice of claims of copyright or other intellectual property infringement (“Agent”), at
            <a href={`mailto:${copyrightInfringmentEmail}`}>{copyrightInfringmentEmail}</a>
            or:<p />
            <p>
              {companyName}
              <br />
              {companyAddress}
            </p>
            <p>Please provide our Agent with a notice including:</p>
            <ul>
              <li>
                Identification of the material on the {thisSiteName_Site} that you claim is infringing, with
                enough detail so that we may locate it on the {thisSiteName_Site};
              </li>
              <li>
                A statement by you that you have a good faith belief that the disputed use is not authorized
                by the copyright owner, its agent, or the law;<br />
                A statement by you declaring under penalty of perjury that (1) the above information in your
                notice is accurate, and (2) that you are the owner of the copyright interest involved or that
                you are authorized to act on behalf of that owner;
              </li>
              <li>Your address, telephone number, and email address; and</li>
              <li>Your physical or electronic signature.</li>
            </ul>
          </Table.Data>
          <Table.Data>
            If you need to report a copyright infringement, please email us at{' '}
            <a href={`mailto:${copyrightInfringmentEmail}`}>{copyrightInfringmentEmail}</a>
          </Table.Data>
        </Table.Row>
      </LegalSection>

      <LegalSection banner="Disclaimer of Warranties">
        <Table.Row>
          <Table.Data>
            THE SERVICES, AND ALL MATERIALS, INFORMATION, AND SERVICES INCLUDED IN THE
            {thisSiteName_SiteCAPS} ARE PROVIDED ON AN “AS IS” AND “AS AVAILABLE” BASIS, WITH NO WARRANTIES
            WHATSOEVER. {companyNameCAPS} AND ITS LICENSORS EXPRESSLY DISCLAIM TO THE FULLEST EXTENT PERMITTED
            BY LAW ALL EXPRESS, IMPLIED, AND STATUTORY WARRANTIES, INCLUDING, WITHOUT LIMITATION, THE
            WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT OF
            PROPRIETARY RIGHTS. {companyNameCAPS} AND ITS LICENSORS DISCLAIM ANY WARRANTIES REGARDING THE
            SECURITY, RELIABILITY, TIMELINESS, AND PERFORMANCE OF THE SERVICES. {companyNameCAPS} DOES NOT
            WARRANT THAT (I) THE SERVICE WILL MEET YOUR SPECIFIC REQUIREMENTS, (II) THE SERVICE WILL BE
            UNINTERRUPTED, TIMELY, SECURE OR ERROR-FREE, (III) THE RESULTS THAT MAY BE OBTAINED FROM THE USE
            OF THE SERVICE WILL BE ACCURATE OR RELIABLE, (IV) THE QUALITY OF ANY PRODUCTS, SERVICES,
            INFORMATION, OR OTHER MATERIAL PURCHASED OR OBTAINED BY YOU THROUGH THE SERVICE WILL MEET YOUR
            EXPECTATIONS, AND (V) ANY ERRORS IN THE {thisSiteName_SiteCAPS} WILL BE CORRECTED.{' '}
            {companyNameCAPS} AND ITS LICENSORS DISCLAIM, ANY WARRANTIES FOR ANY INFORMATION, CONTENT OR
            ADVICE OBTAINED THROUGH THE SERVICES. {companyNameCAPS} AND ITS LICENSORS DISCLAIM ANY WARRANTIES
            FOR SERVICES OR GOODS RECEIVED THROUGH OR ADVERTISED ON THE {companyNameCAPS} SERVICES OR RECEIVED
            THROUGH ANY LINKS PROVIDED BY THE {thisSiteName_SiteCAPS}.
          </Table.Data>
          <Table.Data>
            There might be downtime. There might be bugs. The features might not always meet your exact needs.
          </Table.Data>
        </Table.Row>
        <Table.Row>
          <Table.Data>
            YOU UNDERSTAND AND AGREE THAT YOUR USE OF THE FORMS AND CONTENT ON THE {thisSiteName_SiteCAPS}
            AND THE SERVICE IS AT YOUR OWN DISCRETION AND RISK AND THAT YOU WILL BE SOLELY RESPONSIBLE FOR
            LOSS OF DATA THAT RESULTS FROM THE SUBMISSION OR DOWNLOAD OF SUCH CONTENT.
          </Table.Data>
          <Table.Data>
            You use {thisSiteName} by your own free will and are responsible for your own actions.
          </Table.Data>
        </Table.Row>
        <Table.Row>
          <Table.Data>No Technical support commitment is provided at this time.</Table.Data>
          <Table.Data>We will help because (and when) we want to, not because we have to.</Table.Data>
        </Table.Row>
        <Table.Row>
          <Table.Data>
            SOME STATES OR OTHER JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF IMPLIED WARRANTIES, SO THE ABOVE
            EXCLUSIONS MAY NOT APPLY TO YOU. YOU MAY ALSO HAVE OTHER RIGHTS THAT VARY FROM STATE TO STATE AND
            JURISDICTION TO JURISDICTION.
          </Table.Data>
          <Table.Data>
            If you live somewhere where this doesn't apply, then it doesn't apply. Legal concepts are so
            funny.
          </Table.Data>
        </Table.Row>
      </LegalSection>

      <LegalSection banner="Limitation of Liability">
        <Table.Row>
          <Table.Data>
            UNDER NO CIRCUMSTANCES SHALL {companyNameCAPS} OR ITS LICENSORS BE LIABLE TO YOU ON ACCOUNT OF
            THAT USER’S USE OR MISUSE OF OR RELIANCE ON THE SERVICES OR {thisSiteName_SiteCAPS}
            ARISING FROM ANY CLAIM RELATING TO THIS AGREEMENT OR THE SUBJECT MATTER HEREOF. SUCH LIMITATION OF
            LIABILITY SHALL APPLY TO PREVENT RECOVERY OF DIRECT, INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL,
            EXEMPLARY, AND PUNITIVE DAMAGES WHETHER SUCH CLAIM IS BASED ON WARRANTY, CONTRACT, TORT (INCLUDING
            NEGLIGENCE), OR OTHERWISE, (EVEN IF {companyNameCAPS} OR ITS LICENSORS HAVE BEEN ADVISED OF THE
            POSSIBILITY OF SUCH DAMAGES). SUCH LIMITATION OF LIABILITY SHALL APPLY WHETHER THE DAMAGES ARISE
            FROM USE OR MISUSE OF AND RELIANCE ON THE SERVICES OR {thisSiteName_SiteCAPS}, FROM INABILITY TO
            USE THE SERVICES OR {thisSiteName_SiteCAPS}, OR FROM THE INTERRUPTION, SUSPENSION, OR TERMINATION
            OF THE SERVICES OR {thisSiteName_SiteCAPS}
            (INCLUDING SUCH DAMAGES INCURRED BY THIRD PARTIES).
          </Table.Data>
          <Table.Data>
            We can't be liable for misuse of {thisSiteName} or for {thisSiteName} not meeting your needs.
          </Table.Data>
        </Table.Row>
        <Table.Row>
          <Table.Data>
            THIS LIMITATION SHALL ALSO APPLY, WITHOUT LIMITATION, TO THE COSTS OF PROCUREMENT OF SUBSTITUTE
            GOODS OR SERVICES, LOST PROFITS, OR LOST DATA. SUCH LIMITATION SHALL FURTHER APPLY WITH RESPECT TO
            THE PERFORMANCE OR NON-PERFORMANCE OF THE SERVICES OR {thisSiteName_SiteCAPS} OR ANY INFORMATION
            OR MERCHANDISE THAT APPEARS ON, OR IS LINKED OR RELATED IN ANY WAY TO, THE {companyNameCAPS}
            SERVICES. SUCH LIMITATION SHALL APPLY NOTWITHSTANDING ANY FAILURE OF ESSENTIAL PURPOSE OF ANY
            LIMITED REMEDY AND TO THE FULLEST EXTENT PERMITTED BY LAW.
          </Table.Data>
          <Table.Data>
            For example, if you try and somehow run a business through {thisSiteName} and we have some
            downtime, we can't be responsible for your loss of profit.
          </Table.Data>
        </Table.Row>
        <Table.Row>
          <Table.Data>
            SOME STATES OR OTHER JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF LIABILITY FOR
            INCIDENTAL OR CONSEQUENTIAL DAMAGES, SO THE ABOVE LIMITATIONS AND EXCLUSIONS MAY NOT APPLY TO YOU.
          </Table.Data>
          <Table.Data>
            If this doesn't apply to you because of where you live, it doesn't apply to you.
          </Table.Data>
        </Table.Row>
        <Table.Row>
          <Table.Data>
            Without limiting the foregoing, under no circumstances shall {companyName} or its licensors be
            held liable for any delay or failure in performance resulting directly or indirectly from acts of
            nature, forces, or causes beyond its reasonable control, including, without limitation, Internet
            failures, computer equipment failures, telecommunication equipment failures, other equipment
            failures, electrical power failures, strikes, labor disputes, riots, insurrections, civil
            disturbances, shortages of labor or materials, fires, floods, storms, explosions, acts of God,
            war, governmental actions, orders of domestic or foreign courts or tribunals, non-performance of
            third parties, or loss of or fluctuations in heat, light, or air conditioning.
          </Table.Data>
          <Table.Data>This site might be unavailable at times, for all kinds of reasons.</Table.Data>
        </Table.Row>
      </LegalSection>

      <LegalSection banner="Indemnification">
        <Table.Row>
          <Table.Data>
            You acknowledge that you will be solely and fully responsible for all liabilities incurred through
            the use of the Services. To the maximum extent permitted by applicable law, you agree to hold
            harmless and indemnify {companyName}
            and its employees, officers, agents, or other partners from and against any third party claim
            arising from or in any way related to your use of the Services, including any liability or expense
            arising from all claims, losses, damages (actual and/or consequential), suits, judgments,
            litigation costs and attorneys' fees, of every kind and nature including but not limited to any
            liability arising from or resulting by your data imputed into {thisSiteName} including
            infringement of intellectual property laws or civil or criminal claims. {companyName}
            shall use good faith efforts to provide you with written notice of such claim, suit or action. In
            addition, you expressly waive and relinquish any and all rights and benefits which you may have
            under any other state or federal statute or common law principle of similar effect, to the fullest
            extent permitted by law.
          </Table.Data>
          <Table.Data>
            If you get in trouble with the law for something you did on {thisSiteName}, that's on you and you
            agree that it isn't {companyName} itself's fault. If we receive notification of an infringement by
            you, we'll pass it along to you. You're welcome!
          </Table.Data>
        </Table.Row>
      </LegalSection>

      <LegalSection banner="General">
        <Table.Row>
          <Table.Data>
            These Terms of Service will be governed by and construed in accordance with the laws of the State
            of California, without giving effect to its conflict of laws provisions or your actual state or
            country of residence. If for any reason a court of competent jurisdiction finds any provision or
            portion of the Terms of Service to be unenforceable, the remainder of the Terms of Service will
            continue in full force and effect. These Terms of Service constitute the entire agreement between
            the parties with respect to the subject matter hereof and supersedes and replaces all prior or
            contemporaneous understandings or agreements, written or oral, regarding such subject matter
            (including, but not limited to, any prior versions of the Terms of Service). Any waiver of any
            provision of the Terms of Service will be effective only if in writing and signed by an authorized
            representative of {companyName}.<p />
            <p>
              Questions about the Terms of Service should be addressed to
              {supportEmail}
            </p>
          </Table.Data>
          <Table.Data>
            If part of these terms are in conflict with laws in your region, the rest of the terms still
            apply. Any questions, just ask us.
          </Table.Data>
        </Table.Row>
      </LegalSection>
      <br />
      <p>These Terms of Service were last updated at {lastUpdateDate}</p>
    </Container>
    <Footer />
  </div>
)

export default TermsOfService
